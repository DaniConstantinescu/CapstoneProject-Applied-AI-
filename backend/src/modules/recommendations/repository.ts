import { query } from '../../db.js';
import { BookRow } from '../catalogue/repository.js';

export async function findRecommendationsForUser(userId: number): Promise<BookRow[]> {
  const sql = `
    SELECT b.id, b.title, b.description, b.format, b.price_cents, b.cover_url, b.publisher, b.sort_order,
           a.id AS author_id, a.name AS author_name,
           c.id AS category_id, c.name AS category_name
      FROM books b
      JOIN authors a ON a.id = b.author_id
      JOIN categories c ON c.id = b.category_id
     WHERE b.category_id IN (
             SELECT DISTINCT b2.category_id
               FROM order_items oi
               JOIN orders o ON o.id = oi.order_id AND o.user_id = $1
               JOIN books b2 ON b2.id = oi.book_id
           )
       AND b.id NOT IN (
             SELECT oi.book_id
               FROM order_items oi
               JOIN orders o ON o.id = oi.order_id AND o.user_id = $1
           )
     ORDER BY b.sort_order
     LIMIT 10
  `;
  const result = await query<BookRow>(sql, [userId]);
  return result.rows;
}

export async function findFallbackRecommendations(): Promise<BookRow[]> {
  const sql = `
    SELECT b.id, b.title, b.description, b.format, b.price_cents, b.cover_url, b.publisher, b.sort_order,
           a.id AS author_id, a.name AS author_name,
           c.id AS category_id, c.name AS category_name
      FROM books b
      JOIN authors a ON a.id = b.author_id
      JOIN categories c ON c.id = b.category_id
     ORDER BY b.sort_order
     LIMIT 10
  `;
  const result = await query<BookRow>(sql);
  return result.rows;
}
