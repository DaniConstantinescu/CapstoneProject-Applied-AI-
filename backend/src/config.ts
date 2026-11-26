import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default('postgres://localhost:5432/bookworm'),
  TEST_DATABASE_URL: z.string().default('postgres://localhost:5432/bookworm_test'),
  JWT_SECRET: z.string().min(1).default('super-secret-jwt-key-for-bookworm-poc'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  DELIVERY_DAYS: z.coerce.number().min(3, 'DELIVERY_DAYS must be >= 3').default(5),
  SHIPPING_COST_CENTS: z.coerce.number().min(0).default(0),
  TAX_RATE: z.coerce.number().min(0).max(1).default(0.09),
  CANCELLATION_WINDOW_HOURS: z.coerce.number().min(1).default(48),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid configuration:', parsed.error.format());
  throw new Error('Invalid configuration');
}

export const config = parsed.data;
export type Config = typeof config;
