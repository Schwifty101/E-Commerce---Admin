import React from 'react';

function OrderItem({ order }) {
  return (
    <div className="order-item">
      <div className="order-header">
        <h3>Order #{order.orderNumber}</h3>
        <span className="order-date">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="order-details">
        <p>Total: ${order.total.toFixed(2)}</p>
        <p>Status: {order.status}</p>
      </div>
      <div className="order-items">
        {order.items.map((item, index) => (
          <div key={index} className="item">
            <span>{item.name}</span>
            <span>x{item.quantity}</span>
            <span>${item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderItem;