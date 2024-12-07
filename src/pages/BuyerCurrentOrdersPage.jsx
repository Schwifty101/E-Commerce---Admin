import React from 'react';
import CurrentOrdersList from '../components/orders/CurrentOrdersList';
import '../styling/BuyerCurrentOrders.css';

export function CurrentOrdersPage({ onBack }) {
  return (
    <div className="current-orders-page">
      <button className="back-button" onClick={onBack}>Back</button>
      <h1 id='currentOrdersPage'>Current Orders</h1>
      <CurrentOrdersList />
    </div>
  );
}

