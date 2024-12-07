import React, { useState } from 'react';
import OrderProgress from './OrderProgress';
import { formatDate } from '../../utils/dateFormatter';
import { formatPrice } from '../../utils/formatPrice';

function CurrentOrderItem({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { date, title, description, price, image, sellerName, status } = order;

  return (
    <div className="current-order-item">
      <div 
        className="order-content" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="order-image-container">
          <img src={image} alt={title} className="order-image" />
        </div>
        <div className="order-details">
          <div className="order-header">
            <h3>{title}</h3>
            <span className="order-date">{formatDate(date)}</span>
          </div>
          <p className="order-description">{description}</p>
          <div className="order-footer">
            <span className="order-price">{formatPrice(price)}</span>
            <span className="seller-name">Sold by: {sellerName}</span>
          </div>
        </div>
        <button className="expand-button">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      {isExpanded && (
        <div className="order-progress-container">
          <OrderProgress status={status} />
        </div>
      )}
    </div>
  );
}

export default CurrentOrderItem;