export interface PricingItem {
  unitPriceCents: number;
  quantity: number;
}

export interface PricingResult {
  itemCount: number;
  itemsTotalCents: number;
  taxIncludedCents: number;
  shippingCents: number;
  totalCents: number;
}

/**
 * Computes pricing according to section 5.1 of technical design:
 * itemCount     = sum(quantity)
 * itemsTotal    = sum(unitPriceCents * quantity) (tax included)
 * taxIncluded   = round(itemsTotal * r / (1 + r)) (r = taxRate)
 * shipping      = shippingCostCents
 * total         = itemsTotal + shipping (NOT + tax)
 */
export function calculatePricing(
  items: PricingItem[],
  taxRate: number,
  shippingCostCents: number = 0
): PricingResult {
  let itemCount = 0;
  let itemsTotalCents = 0;

  for (const item of items) {
    itemCount += item.quantity;
    itemsTotalCents += item.unitPriceCents * item.quantity;
  }

  const taxIncludedCents = Math.round((itemsTotalCents * taxRate) / (1 + taxRate));
  const shippingCents = shippingCostCents;
  const totalCents = itemsTotalCents + shippingCents;

  return {
    itemCount,
    itemsTotalCents,
    taxIncludedCents,
    shippingCents,
    totalCents,
  };
}
