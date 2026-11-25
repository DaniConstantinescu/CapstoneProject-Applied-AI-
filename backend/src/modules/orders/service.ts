import { getEstimatedDeliveryDate } from '../../lib/delivery.js';
import { deriveOrderStatus, isOrderCancellable, OrderStatus } from '../../lib/orderStatus.js';
import { NotFoundError } from '../../lib/errors.js';
import { BookDto } from '../catalogue/service.js';
import { getCart, CartDto } from '../cart/service.js';
import { CheckoutRequestInput, ShippingAddressInput } from './schemas.js';
import * as ordersRepo from './repository.js';

export interface OrderItemDto {
  book: BookDto;
  title: string;
  authorName: string;
  unitPriceCents: number;
  quantity: number;
}

export interface OrderDto {
  id: number;
  status: OrderStatus;
  cancellable: boolean;
  confirmedAt: string;
  cancelledAt: string | null;
  estimatedDeliveryDate: string;
  paymentMethod: 'credit_card' | 'debit_card';
  paymentStatus: 'paid' | 'refunded';
  address: ShippingAddressInput;
  items: OrderItemDto[];
  itemCount: number;
  itemsTotalCents: number;
  taxIncludedCents: number;
  shippingCents: number;
  totalCents: number;
}

export interface OrderSummaryItemDto {
  bookId: number;
  title: string;
  coverUrl: string;
  quantity: number;
}

export interface OrderSummaryDto {
  id: number;
  status: OrderStatus;
  confirmedAt: string;
  totalCents: number;
  itemCount: number;
  items: OrderSummaryItemDto[];
}

function formatDateOnly(val: string | Date): string {
  if (typeof val === 'string') {
    return val.includes('T') ? val.split('T')[0] : val;
  }
  return val.toISOString().split('T')[0];
}

function toOrderDto(
  order: ordersRepo.OrderDbRow,
  items: ordersRepo.OrderItemDbRow[],
  now: Date = new Date()
): OrderDto {
  const deliveryDateStr = formatDateOnly(order.estimated_delivery_date);
  const status = deriveOrderStatus(
    {
      confirmedAt: new Date(order.confirmed_at),
      cancelledAt: order.cancelled_at ? new Date(order.cancelled_at) : null,
      estimatedDeliveryDate: deliveryDateStr,
    },
    now
  );

  const formattedItems: OrderItemDto[] = items.map((item) => ({
    book: {
      id: item.book_id,
      title: item.title,
      description: item.description || '',
      format: item.format || 'Paperback',
      priceCents: item.unit_price_cents,
      coverUrl: item.cover_url || '',
      publisher: item.publisher || '',
      author: {
        id: item.author_id || 0,
        name: item.author_name,
      },
      category: {
        id: item.category_id || 0,
        name: item.category_name || '',
      },
      estimatedDeliveryDate: deliveryDateStr,
    },
    title: item.title,
    authorName: item.author_name,
    unitPriceCents: item.unit_price_cents,
    quantity: item.quantity,
  }));

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    id: order.id,
    status,
    cancellable: isOrderCancellable(status),
    confirmedAt: new Date(order.confirmed_at).toISOString(),
    cancelledAt: order.cancelled_at ? new Date(order.cancelled_at).toISOString() : null,
    estimatedDeliveryDate: deliveryDateStr,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    address: {
      firstName: order.shipping_first_name,
      lastName: order.shipping_last_name,
      phone: order.shipping_phone,
      address: order.shipping_address,
      city: order.shipping_city,
      postalCode: order.shipping_postal_code,
      state: order.shipping_state,
      country: order.shipping_country,
    },
    items: formattedItems,
    itemCount,
    itemsTotalCents: order.items_total_cents,
    taxIncludedCents: order.tax_cents,
    shippingCents: order.shipping_cents,
    totalCents: order.total_cents,
  };
}

export async function checkout(
  userId: number,
  input: CheckoutRequestInput
): Promise<OrderDto> {
  const deliveryDate = getEstimatedDeliveryDate();
  const { order, items } = await ordersRepo.createOrderTransaction(userId, input, deliveryDate);
  return toOrderDto(order, items);
}

export async function getUserOrders(userId: number): Promise<{ items: OrderSummaryDto[] }> {
  const orders = await ordersRepo.findOrdersByUserId(userId);
  const now = new Date();

  const summaries: OrderSummaryDto[] = [];
  for (const order of orders) {
    const items = await ordersRepo.findOrderItemsByOrderId(order.id);
    const deliveryDateStr = formatDateOnly(order.estimated_delivery_date);
    const status = deriveOrderStatus(
      {
        confirmedAt: new Date(order.confirmed_at),
        cancelledAt: order.cancelled_at ? new Date(order.cancelled_at) : null,
        estimatedDeliveryDate: deliveryDateStr,
      },
      now
    );

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    summaries.push({
      id: order.id,
      status,
      confirmedAt: new Date(order.confirmed_at).toISOString(),
      totalCents: order.total_cents,
      itemCount,
      items: items.map((i) => ({
        bookId: i.book_id,
        title: i.title,
        coverUrl: i.cover_url || '',
        quantity: i.quantity,
      })),
    });
  }

  return { items: summaries };
}

export async function getOrderById(orderId: number, userId: number): Promise<OrderDto> {
  const order = await ordersRepo.findOrderByIdAndUserId(orderId, userId);
  if (!order) {
    throw new NotFoundError(`Order with ID ${orderId} not found`);
  }

  const items = await ordersRepo.findOrderItemsByOrderId(orderId);
  return toOrderDto(order, items);
}

export async function cancelOrder(orderId: number, userId: number): Promise<OrderDto> {
  const order = await ordersRepo.cancelOrderAtomic(orderId, userId);
  const items = await ordersRepo.findOrderItemsByOrderId(orderId);
  return toOrderDto(order, items);
}

export async function buyAgain(orderId: number, userId: number): Promise<CartDto> {
  await ordersRepo.buyAgainTransaction(orderId, userId);
  return getCart(userId);
}
