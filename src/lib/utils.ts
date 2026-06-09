export function formatMoney(amount: number | string, currency: string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const symbol = { USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AUD: 'A$', CNY: '¥', INR: '₹', JPY: '¥' }[currency] || '';
  return symbol + num.toLocaleString('en-US');
}

export function formatDate(iso: string | Date) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function relativeDate(iso: string | Date) {
  const d = new Date(iso);
  const now = new Date(); // Use actual now
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return days + ' days ago';
  if (days < 30) return Math.floor(days / 7) + 'w ago';
  return Math.floor(days / 30) + 'mo ago';
}
