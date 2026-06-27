/** Format an amount as Tanzanian Shillings — no decimals. */
export const formatTZS = (amount) =>
  new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
