import { query } from '../../db.js';
import { BookRow } from '../catalogue/repository.js';

export interface CartItemDbRow {
  quantity: number;
  created_at: Date;
  book_id: number;
  title: string;
  description: string;
  format: 'Paperback' | 'Hardcover';
  price_cents: number;
  cover_url: string;
  publisher: string;
  sort_order: number;
  author_id: number;
  author_name: string;
  category_id: number;
  category_name: string;
}

export async function findCartItemsWithBook(userId: number): Promise<CartItemDbRow[]> {
  const sql = `
    SELECT ci.quantity, ci.created_at,
           b.id AS book_id, b.title, b.description, b.format, b.price_cents, b.cover_url, b.publisher, b.sort_order,
           a.id AS author_id, a.name AS author_name,
           c.id AS category_id, c.name AS category_name
      FROM cart_items ci
      JOIN books b ON b.id = ci.book_id
      JOIN authors a ON a.id = b.author_id
      JOIN categories c ON c.id = b.category_id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at ASC
  `;
  const result = await query<CartItemDbRow>(sql, [userId]);
  return result.rows;
}

export async function upsertCartItem(userId: number, bookId: number, quantity: number): Promise<void> {
  const sql = `
    INSERT INTO cart_items (user_id, book_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, book_id)
    DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
  `;
  await query(sql, [userId, bookId, quantity]);
}

export async function setCartItemQuantity(userId: number, bookId: number, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await removeCartItem(userId, bookId);
    return;
  }

  const sql = `
    INSERT INTO cart_items (user_id, book_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, book_id)
    DO UPDATE SET quantity = EXCLUDED.quantity
  `;
  await query(sql, [userId, bookId, quantity]);
}

export async function removeCartItem(userId: number, bookId: number): Promise<void> {
  await query('DELETE FROM cart_items WHERE user_id = $1 AND book_id = $2', [userId, bookId]);
}
