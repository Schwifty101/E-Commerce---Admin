import React from 'react';

function OrderConfirmation({ onBack }) {
  return (
    <div className="order-confirmation">
      <h2>Thank You!</h2>
      <p>Your order has been confirmed.</p>
      <p>We'll send you an email with your order details shortly.</p>
      <button onClick={onBack} className="back-button">
        Return to Shop
      </button>
    </div>
  );
}

export default OrderConfirmation;