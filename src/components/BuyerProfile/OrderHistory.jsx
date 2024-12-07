import React from 'react';
import OrderItem from './OrderItem';
import { useOrders } from '../../hooks/useOrders';

function OrderHistory() {
  const { orders, isLoading, error } = useOrders();

  if (isLoading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-history-section">
      <h2>Order History</h2>
      {orders.length === 0 ? (
        <p className="no-orders">No orders found</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;