import { query, withTransaction } from '../../db.js';
import { calculatePricing } from '../../lib/pricing.js';
import { config } from '../../config.js';
import {
  CartEmptyError,
  NotFoundError,
  CancellationNotAllowedError,
} from '../../lib/errors.js';
import { CheckoutRequestInput } from './schemas.js';

export interface OrderDbRow {
  id: number;
  user_id: number;
  confirmed_at: Date;
  cancelled_at: Date | null;
  estimated_delivery_date: string;
  items_total_cents: number;
  tax_rate: string;
  tax_cents: number;
  shipping_cents: number;
  total_cents: number;
  payment_method: 'credit_card' | 'debit_card';
  payment_status: 'paid' | 'refunded';
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_state: string;
  shipping_country: string;
}

export interface OrderItemDbRow {
  id: number;
  order_id: number;
  book_id: number;
  title: string;
  author_name: string;
  unit_price_cents: number;
  quantity: number;
  // joined book fields
  description?: string;
  format?: 'Paperback' | 'Hardcover';
  cover_url?: string;
  publisher?: string;
  author_id?: number;
  category_id?: number;
  category_name?: string;
}

export async function createOrderTransaction(
  userId: number,
  input: CheckoutRequestInput,
  deliveryDate: string
): Promise<{ order: OrderDbRow; items: OrderItemDbRow[] }> {
  return withTransaction(async (client) => {
    // 1. Lock and read cart
    const cartRes = await client.query<{
      book_id: number;
      quantity: number;
      title: string;
      price_cents: number;
      author_name: string;
    }>(
      `SELECT ci.book_id, ci.quantity, b.title, b.price_cents, a.name AS author_name
         FROM cart_items ci
         JOIN books b ON b.id = ci.book_id
         JOIN authors a ON a.id = b.author_id
        WHERE ci.user_id = $1
          FOR UPDATE`,
      [userId]
    );

    if (cartRes.rows.length === 0) {
      throw new CartEmptyError();
    }

    // 2. Compute pricing from DB prices
    const pricingItems = cartRes.rows.map((r) => ({
      unitPriceCents: r.price_cents,
      quantity: r.quantity,
    }));
    const pricing = calculatePricing(pricingItems, config.TAX_RATE, config.SHIPPING_COST_CENTS);

    // 3. Insert order
    const orderRes = await client.query<OrderDbRow>(
      `INSERT INTO orders (
        user_id, estimated_delivery_date, items_total_cents, tax_rate, tax_cents,
        shipping_cents, total_cents, payment_method, payment_status,
        shipping_first_name, shipping_last_name, shipping_phone, shipping_address,
        shipping_city, shipping_postal_code, shipping_state, shipping_country
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 'paid',
        $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING *`,
      [
        userId,
        deliveryDate,
        pricing.itemsTotalCents,
        config.TAX_RATE,
        pricing.taxIncludedCents,
        pricing.shippingCents,
        pricing.totalCents,
        input.paymentMethod,
        input.address.firstName,
        input.address.lastName,
        input.address.phone,
        input.address.address,
        input.address.city,
        input.address.postalCode,
        input.address.state,
        input.address.country,
      ]
    );

    const order = orderRes.rows[0];

    // 4. Insert order items
    const insertedItems: OrderItemDbRow[] = [];
    for (const item of cartRes.rows) {
      const itemRes = await client.query<OrderItemDbRow>(
        `INSERT INTO order_items (
          order_id, book_id, title, author_name, unit_price_cents, quantity
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [order.id, item.book_id, item.title, item.author_name, item.price_cents, item.quantity]
      );
      insertedItems.push(itemRes.rows[0]);
    }

    // 5. Clear cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    return { order, items: insertedItems };
  });
}

export async function findOrdersByUserId(userId: number): Promise<OrderDbRow[]> {
  const result = await query<OrderDbRow>(
    `SELECT * FROM orders
      WHERE user_id = $1
      ORDER BY confirmed_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function findOrderItemsByOrderId(orderId: number): Promise<OrderItemDbRow[]> {
  const sql = `
    SELECT oi.id, oi.order_id, oi.book_id, oi.title, oi.author_name, oi.unit_price_cents, oi.quantity,
           b.description, b.format, b.cover_url, b.publisher, b.author_id, b.category_id,
           c.name AS category_name
      FROM order_items oi
      JOIN books b ON b.id = oi.book_id
      JOIN categories c ON c.id = b.category_id
     WHERE oi.order_id = $1
     ORDER BY oi.id ASC
  `;
  const result = await query<OrderItemDbRow>(sql, [orderId]);
  return result.rows;
}

export async function findOrderByIdAndUserId(orderId: number, userId: number): Promise<OrderDbRow | null> {
  const result = await query<OrderDbRow>(
    'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
    [orderId, userId]
  );
  return result.rows[0] || null;
}

export async function cancelOrderAtomic(
  orderId: number,
  userId: number,
  windowHours: number = config.CANCELLATION_WINDOW_HOURS
): Promise<OrderDbRow> {
  const updateRes = await query<OrderDbRow>(
    `UPDATE orders
        SET cancelled_at = now(), payment_status = 'refunded'
      WHERE id = $1 AND user_id = $2
        AND cancelled_at IS NULL
        AND now() < confirmed_at + make_interval(hours => $3)
      RETURNING *`,
    [orderId, userId, windowHours]
  );

  if (updateRes.rows.length > 0) {
    return updateRes.rows[0];
  }

  // Determine why update failed
  const existing = await findOrderByIdAndUserId(orderId, userId);
  if (!existing) {
    throw new NotFoundError(`Order with ID ${orderId} not found`);
  }

  throw new CancellationNotAllowedError(
    existing.cancelled_at
      ? 'Order is already cancelled'
      : 'Order cancellation window (48 hours) has expired'
  );
}

export async function buyAgainTransaction(orderId: number, userId: number): Promise<void> {
  const existing = await findOrderByIdAndUserId(orderId, userId);
  if (!existing) {
    throw new NotFoundError(`Order with ID ${orderId} not found`);
  }

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO cart_items (user_id, book_id, quantity)
       SELECT $1, oi.book_id, oi.quantity
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
        WHERE o.id = $2 AND o.user_id = $1
       ON CONFLICT (user_id, book_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
      [userId, orderId]
    );
  });
}
