import pg from 'pg';
import { fileURLToPath } from 'url';
import { config } from '../src/config.js';
import { runMigrations } from './migrate.js';
import { runSeed } from './seed.js';

export async function runReset(connectionString?: string) {
  const connStr = connectionString || config.DATABASE_URL;
  const pool = new pg.Pool({ connectionString: connStr });
  const client = await pool.connect();

  try {
    console.log('Resetting database...');
    await client.query(`
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS wishlist_items CASCADE;
      DROP TABLE IF EXISTS cart_items CASCADE;
      DROP TABLE IF EXISTS books CASCADE;
      DROP TABLE IF EXISTS authors CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS schema_migrations CASCADE;
    `);
    console.log('Dropped all tables.');
  } finally {
    client.release();
    await pool.end();
  }

  await runMigrations(connStr);
  await runSeed(connStr);
  console.log('Database reset complete.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runReset()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
