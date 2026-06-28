import { describe, it, expect } from 'vitest';
import { cartTotal, lineTotal } from '../modules/pos/cart.js';

describe('POS cart', () => {
  it('computes line and cart totals', () => {
    const items = [
      { unit_price: 1000, quantity: 2 },
      { unit_price: 500, quantity: 3 },
    ];
    expect(lineTotal(items[0])).toBe(2000);
    expect(cartTotal(items)).toBe(3500);
  });

  it('totals an empty cart to zero', () => {
    expect(cartTotal([])).toBe(0);
  });
});
