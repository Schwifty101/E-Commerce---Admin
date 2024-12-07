import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { CART_ITEM_COUNT } from '../../utils/constants';

export function CartButton({onClick}) {
  return (
    <button className="cart-button"  onClick={onClick}>
      <ShoppingCart className="cart-icon" />
      <span className="cart-count">
        {CART_ITEM_COUNT}
      </span>
    </button>
  );
}