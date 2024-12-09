import React, { useState } from 'react';
import OrderProgress from './OrderProgress';
import { formatDate } from '../../utils/dateFormatter';
import { formatPrice } from '../../utils/formatPrice';

function CurrentOrderItem({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { orderNumber, customer, vendor, items, total, status, createdAt } = order;

  // Get the first item name to display in the header
  const displayName = items[0]?.name || 'Unnamed Item';

  return (
    <div className="current-order-item">
      <div 
        className="order-content" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="order-details">
          <div className="order-header">
            <h3>{displayName}</h3>
            <span className="order-date">{formatDate(createdAt)}</span>
          </div>
          <p className="order-description">Vendor: {vendor.name}</p>
          <div className="order-footer">
            <span className="order-price">{formatPrice(total)}</span>
          </div>
        </div>
        <button className="expand-button">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      {isExpanded && (
        <div className="order-items-container">
          <OrderProgress status={status} />
          {items.map(item => (
            <div key={item._id} className="order-item">
              <span>{item.name} x {item.quantity}</span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CurrentOrderItem;