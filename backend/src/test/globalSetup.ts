import { runReset } from '../../scripts/reset.js';
import { config } from '../config.js';

export async function setup() {
  process.env.NODE_ENV = 'test';
  await runReset(config.TEST_DATABASE_URL);
}
