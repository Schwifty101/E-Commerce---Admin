import React, { useState } from 'react';
import { formatDate } from '../../utils/dateFormatter';
import { formatPrice } from '../../utils/formatPrice';

function OrderItem({ order }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const handleSubmitReview = () => {
    // TODO: Implement API call to save review
    console.log({ orderId: order.id, rating, review });
    setIsReviewing(false);
  };

  const { date, title, description, price, image, sellerName } = order;

  return (
    <div className="order-item">
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
        <div className="review-section">
          {!isReviewing ? (
            <button 
              className="review-button"
              onClick={() => setIsReviewing(true)}
            >
              Write a Review
            </button>
          ) : (
            <div className="review-form">
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= rating ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review here..."
                className="review-textarea"
              />
              <div className="review-actions">
                <button 
                  className="submit-review"
                  onClick={handleSubmitReview}
                >
                  Submit Review
                </button>
                <button 
                  className="cancel-review"
                  onClick={() => setIsReviewing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderItem;