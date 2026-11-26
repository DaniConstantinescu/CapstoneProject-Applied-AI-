import { query, withTransaction } from '../../db.js';
import { BookRow } from '../catalogue/repository.js';

export async function findWishlistBooks(userId: number): Promise<BookRow[]> {
  const sql = `
    SELECT b.id, b.title, b.description, b.format, b.price_cents, b.cover_url, b.publisher, b.sort_order,
           a.id AS author_id, a.name AS author_name,
           c.id AS category_id, c.name AS category_name
      FROM wishlist_items wi
      JOIN books b ON b.id = wi.book_id
      JOIN authors a ON a.id = b.author_id
      JOIN categories c ON c.id = b.category_id
     WHERE wi.user_id = $1
     ORDER BY wi.created_at DESC
  `;
  const result = await query<BookRow>(sql, [userId]);
  return result.rows;
}

export async function addWishlistItem(userId: number, bookId: number): Promise<void> {
  const sql = `
    INSERT INTO wishlist_items (user_id, book_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, book_id) DO NOTHING
  `;
  await query(sql, [userId, bookId]);
}

export async function removeWishlistItem(userId: number, bookId: number): Promise<void> {
  await query('DELETE FROM wishlist_items WHERE user_id = $1 AND book_id = $2', [userId, bookId]);
}

export async function moveWishlistItemToCartTx(userId: number, bookId: number): Promise<void> {
  await withTransaction(async (client) => {
    // 1. Add 1 to cart
    await client.query(`
      INSERT INTO cart_items (user_id, book_id, quantity)
      VALUES ($1, $2, 1)
      ON CONFLICT (user_id, book_id)
      DO UPDATE SET quantity = cart_items.quantity + 1
    `, [userId, bookId]);

    // 2. Remove from wishlist
    await client.query(`
      DELETE FROM wishlist_items
       WHERE user_id = $1 AND book_id = $2
    `, [userId, bookId]);
  });
}
