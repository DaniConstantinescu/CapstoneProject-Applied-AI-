const currencyFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const deliveryDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const fullDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatPrice(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00Z`);
    return deliveryDateFormatter.format(d);
  } catch {
    return dateStr;
  }
}

export function formatFullDateTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return fullDateFormatter.format(d);
  } catch {
    return isoStr;
  }
}

export function formatDeliveryBy(dateStr: string): string {
  return `Delivery by ${formatDate(dateStr)}`;
}
