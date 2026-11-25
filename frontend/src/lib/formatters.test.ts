import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, formatDeliveryBy } from './formatters';

describe('Formatters', () => {
  it('formatPrice formats cents as EUR correctly', () => {
    expect(formatPrice(1999)).toMatch(/€\s?19.99/);
    expect(formatPrice(0)).toMatch(/€\s?0.00/);
    expect(formatPrice(25000)).toMatch(/€\s?250.00/);
  });

  it('formatDate formats YYYY-MM-DD string into short date', () => {
    const formatted = formatDate('2025-07-21');
    expect(formatted).toContain('Jul');
    expect(formatted).toContain('21');
  });

  it('formatDeliveryBy prepends "Delivery by "', () => {
    const res = formatDeliveryBy('2025-07-21');
    expect(res).toMatch(/^Delivery by /);
    expect(res).toContain('Jul');
  });
});
