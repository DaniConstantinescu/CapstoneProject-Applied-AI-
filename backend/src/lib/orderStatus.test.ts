import { describe, it, expect } from 'vitest';
import { deriveOrderStatus, isOrderCancellable } from './orderStatus.js';

describe('deriveOrderStatus', () => {
  const confirmedAt = new Date('2025-07-01T10:00:00Z');
  const estimatedDeliveryDate = '2025-07-06'; // 5 days later

  it('returns Cancelled when cancelledAt timestamp is present', () => {
    const status = deriveOrderStatus(
      {
        confirmedAt,
        cancelledAt: new Date('2025-07-01T12:00:00Z'),
        estimatedDeliveryDate,
      },
      new Date('2025-07-01T14:00:00Z')
    );
    expect(status).toBe('Cancelled');
    expect(isOrderCancellable(status)).toBe(false);
  });

  it('returns Confirmed within the 48-hour window (e.g. at 47 hours)', () => {
    const now = new Date('2025-07-03T09:00:00Z'); // 47 hours later
    const status = deriveOrderStatus(
      {
        confirmedAt,
        cancelledAt: null,
        estimatedDeliveryDate,
      },
      now
    );
    expect(status).toBe('Confirmed');
    expect(isOrderCancellable(status)).toBe(true);
  });

  it('returns Shipped after 48 hours but before end of estimated delivery date', () => {
    const now = new Date('2025-07-03T11:00:00Z'); // 49 hours later
    const status = deriveOrderStatus(
      {
        confirmedAt,
        cancelledAt: null,
        estimatedDeliveryDate,
      },
      now
    );
    expect(status).toBe('Shipped');
    expect(isOrderCancellable(status)).toBe(false);
  });

  it('returns Shipped on the estimated delivery date itself', () => {
    const now = new Date('2025-07-06T18:00:00Z');
    const status = deriveOrderStatus(
      {
        confirmedAt,
        cancelledAt: null,
        estimatedDeliveryDate,
      },
      now
    );
    expect(status).toBe('Shipped');
    expect(isOrderCancellable(status)).toBe(false);
  });

  it('returns Delivered after 00:00 UTC of the day following estimated delivery date', () => {
    const now = new Date('2025-07-07T00:01:00Z'); // 1 minute into July 7th
    const status = deriveOrderStatus(
      {
        confirmedAt,
        cancelledAt: null,
        estimatedDeliveryDate,
      },
      now
    );
    expect(status).toBe('Delivered');
    expect(isOrderCancellable(status)).toBe(false);
  });
});
