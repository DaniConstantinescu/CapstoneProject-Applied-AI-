import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { config } from '../src/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(connectionString?: string) {
  const connStr = connectionString || config.DATABASE_URL;
  const pool = new pg.Pool({ connectionString: connStr });
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    const migrationsDir = path.resolve(__dirname, '../db/migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found at', migrationsDir);
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const { rows: appliedRows } = await client.query('SELECT name FROM schema_migrations');
    const appliedSet = new Set(appliedRows.map((r) => r.name));

    for (const file of files) {
      if (!appliedSet.has(file)) {
        console.log(`Applying migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied migration: ${file}`);
      } else {
        console.log(`Skipping already applied migration: ${file}`);
      }
    }
    console.log('Migrations complete.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
