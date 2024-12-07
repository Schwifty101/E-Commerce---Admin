import React from 'react';
import CurrentOrderItem from './CurrentOrderItem';
import { useCurrentOrders } from '../../hooks/useCurrentOrders';

function CurrentOrdersList() {
  const { orders, isLoading, error } = useCurrentOrders();

  if (isLoading) {
    return <div className="orders-message">Loading orders...</div>;
  }

  if (error) {
    return <div className="orders-message error">{error}</div>;
  }

  if (!orders.length) {
    return (
      <div className="orders-message">
        <h2>No Current Orders</h2>
        <p>When you place new orders, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="current-orders-list">
      {orders.map(order => (
        <CurrentOrderItem key={order.id} order={order} />
      ))}
    </div>
  );
}

export default CurrentOrdersList;