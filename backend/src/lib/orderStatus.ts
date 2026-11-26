export type OrderStatus = 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderStatusContext {
  confirmedAt: Date;
  cancelledAt: Date | null;
  estimatedDeliveryDate: string; // YYYY-MM-DD
}

/**
 * Derives order status purely from timestamps and estimated delivery date according to section 5.3:
 * - If cancelledAt is set -> 'Cancelled'
 * - If within 48h of confirmedAt -> 'Confirmed'
 * - From 48h until end of estimatedDeliveryDate (00:00 UTC next day) -> 'Shipped'
 * - After estimatedDeliveryDate (00:00 UTC next day) -> 'Delivered'
 */
export function deriveOrderStatus(order: OrderStatusContext, now: Date): OrderStatus {
  if (order.cancelledAt) {
    return 'Cancelled';
  }

  const hoursSinceConfirmation = (now.getTime() - order.confirmedAt.getTime()) / 36e5;
  if (hoursSinceConfirmation < 48) {
    return 'Confirmed';
  }

  // "after the estimated delivery date" = from 00:00 UTC of the following day
  const deliveredFrom = Date.parse(`${order.estimatedDeliveryDate}T00:00:00Z`) + 24 * 36e5;
  return now.getTime() < deliveredFrom ? 'Shipped' : 'Delivered';
}

export function isOrderCancellable(status: OrderStatus): boolean {
  return status === 'Confirmed';
}
