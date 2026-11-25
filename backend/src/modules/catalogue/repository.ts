import { query } from '../../db.js';
import { ListBooksQuery } from './schemas.js';

export interface CategoryRow {
  id: number;
  name: string;
  sort_order: number;
}

export interface AuthorSummaryRow {
  id: number;
  name: string;
}

export interface AuthorDetailRow {
  id: number;
  name: string;
  bio: string | null;
  photo_url: string | null;
}

export interface BookRow {
  id: number;
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

export interface BookDetailRow extends BookRow {
  author_bio: string | null;
  author_photo_url: string | null;
}

export async function findCategories(): Promise<CategoryRow[]> {
  const result = await query<CategoryRow>(
    'SELECT id, name, sort_order FROM categories ORDER BY sort_order'
  );
  return result.rows;
}

export async function findAuthors(): Promise<AuthorSummaryRow[]> {
  const result = await query<AuthorSummaryRow>(
    'SELECT id, name FROM authors ORDER BY name'
  );
  return result.rows;
}

function escapeIlike(str: string): string {
  return str.replace(/[\\%_]/g, '\\$&');
}

export async function findBooks(filters: ListBooksQuery): Promise<BookRow[]> {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.q && filters.q.trim().length > 0) {
    const escaped = escapeIlike(filters.q.trim());
    params.push(`%${escaped}%`);
    conditions.push(`(b.title ILIKE $${params.length} OR a.name ILIKE $${params.length})`);
  }

  if (filters.categoryId) {
    params.push(filters.categoryId);
    conditions.push(`b.category_id = $${params.length}`);
  }

  if (filters.authorId) {
    params.push(filters.authorId);
    conditions.push(`b.author_id = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'b.sort_order';
  if (filters.sort === 'price_asc') {
    orderBy = 'b.price_cents, b.id';
  } else if (filters.sort === 'price_desc') {
    orderBy = 'b.price_cents DESC, b.id';
  } else if (filters.sort === 'title_asc') {
    orderBy = 'lower(b.title), b.id';
  }

  const sql = `
    SELECT b.id, b.title, b.description, b.format, b.price_cents, b.cover_url, b.publisher, b.sort_order,
           a.id AS author_id, a.name AS author_name,
           c.id AS category_id, c.name AS category_name
      FROM books b
      JOIN authors a ON a.id = b.author_id
      JOIN categories c ON c.id = b.category_id
     ${whereClause}
     ORDER BY ${orderBy}
  `;

  const result = await query<BookRow>(sql, params);
  return result.rows;
}

export async function findBookById(id: number): Promise<BookDetailRow | null> {
  const sql = `
    SELECT b.id, b.title, b.description, b.format, b.price_cents, b.cover_url, b.publisher, b.sort_order,
           a.id AS author_id, a.name AS author_name, a.bio AS author_bio, a.photo_url AS author_photo_url,
           c.id AS category_id, c.name AS category_name
      FROM books b
      JOIN authors a ON a.id = b.author_id
      JOIN categories c ON c.id = b.category_id
     WHERE b.id = $1
  `;
  const result = await query<BookDetailRow>(sql, [id]);
  return result.rows[0] || null;
}

export async function findRelatedBooks(bookId: number): Promise<BookRow[]> {
  const sql = `
    SELECT b.id, b.title, b.description, b.format, b.price_cents, b.cover_url, b.publisher, b.sort_order,
           a.id AS author_id, a.name AS author_name,
           c.id AS category_id, c.name AS category_name
      FROM books b
      JOIN authors a ON a.id = b.author_id
      JOIN categories c ON c.id = b.category_id
     WHERE b.category_id = (SELECT category_id FROM books WHERE id = $1)
       AND b.id <> $1
     ORDER BY b.sort_order
     LIMIT 4
  `;
  const result = await query<BookRow>(sql, [bookId]);
  return result.rows;
}

export async function isBookInWishlist(userId: number, bookId: number): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM wishlist_items WHERE user_id = $1 AND book_id = $2',
    [userId, bookId]
  );
  return result.rowCount !== null && result.rowCount > 0;
}
