/** POS cart helpers. Displayed totals use the product's retail price as an
 *  estimate; the server applies dual-pricing rules and returns the authoritative
 *  total on the sale response. */
export const lineTotal = (item) => item.unit_price * item.quantity;

export const cartTotal = (items) => items.reduce((sum, i) => sum + lineTotal(i), 0);
