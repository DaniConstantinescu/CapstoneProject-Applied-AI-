import { config } from '../config.js';

export function getEstimatedDeliveryDate(
  deliveryDays: number = config.DELIVERY_DAYS,
  now: Date = new Date()
): string {
  const future = new Date(now.getTime() + deliveryDays * 24 * 36e5);
  return future.toISOString().split('T')[0];
}
