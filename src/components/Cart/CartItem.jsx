import React from 'react';

function CartItem({ item, onQuantityChange }) {
  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} className="item-image" />
      <div className="item-details">
        <h2>{item.name}</h2>
        <p className="price">${item.price}</p>
        <p className="subtotal">Subtotal: ${item.subtotal}</p>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onQuantityChange(item.productId, parseInt(e.target.value))}
          className="quantity-input"
        />
      </div>
    </div>
  );
}

export default CartItem;