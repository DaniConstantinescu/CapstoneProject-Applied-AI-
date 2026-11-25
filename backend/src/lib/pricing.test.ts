import { describe, it, expect } from 'vitest';
import { calculatePricing } from './pricing.js';

describe('calculatePricing', () => {
  it('calculates totals correctly with 0% shipping and standard tax rate', () => {
    // 1 item of €18.99 (1899 cents) and 2 items of €24.99 (2499 cents)
    const items = [
      { unitPriceCents: 1899, quantity: 1 },
      { unitPriceCents: 2499, quantity: 2 },
    ];
    const taxRate = 0.09; // 9%
    const shipping = 0;

    const result = calculatePricing(items, taxRate, shipping);

    expect(result.itemCount).toBe(3);
    // itemsTotal = 1899 + 4998 = 6897
    expect(result.itemsTotalCents).toBe(6897);
    // taxIncluded = round(6897 * 0.09 / 1.09) = round(569.477) = 569
    expect(result.taxIncludedCents).toBe(569);
    expect(result.shippingCents).toBe(0);
    // total = itemsTotal + shipping = 6897
    expect(result.totalCents).toBe(6897);
  });

  it('handles empty items list', () => {
    const result = calculatePricing([], 0.09, 0);

    expect(result.itemCount).toBe(0);
    expect(result.itemsTotalCents).toBe(0);
    expect(result.taxIncludedCents).toBe(0);
    expect(result.shippingCents).toBe(0);
    expect(result.totalCents).toBe(0);
  });

  it('adds flat shipping to total without double-taxing', () => {
    const items = [{ unitPriceCents: 2000, quantity: 2 }];
    const taxRate = 0.10;
    const shipping = 500; // €5.00

    const result = calculatePricing(items, taxRate, shipping);

    expect(result.itemCount).toBe(2);
    expect(result.itemsTotalCents).toBe(4000);
    // taxIncluded = round(4000 * 0.10 / 1.10) = round(363.636) = 364
    expect(result.taxIncludedCents).toBe(364);
    expect(result.shippingCents).toBe(500);
    // total = itemsTotal + shipping = 4500
    expect(result.totalCents).toBe(4500);
  });
});
