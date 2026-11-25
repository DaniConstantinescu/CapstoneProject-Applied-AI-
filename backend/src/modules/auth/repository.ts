import { query } from '../../db.js';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await query<UserRow>(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE lower(email) = lower($1)',
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id: number): Promise<UserRow | null> {
  const result = await query<UserRow>(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string
): Promise<UserRow> {
  const result = await query<UserRow>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, password_hash, created_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
}
