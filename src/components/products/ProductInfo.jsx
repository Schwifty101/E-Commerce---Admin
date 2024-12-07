import React from 'react';
import { Star, Truck, Shield, Heart } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

export function ProductInfo({ product }) {
  return (
    <div className="product-info">
      <h1 className="product-info-title">{product.name}</h1>
      <div className="product-info-meta">
        <div className="seller-info">
          by <span className="seller-name">{product.seller.name}</span>
        </div>
        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`star ${i < product.ratings ? 'filled' : ''}`}
              size={16}
            />
          ))}
          <span className="rating-count">({product.reviews?.length || 0} reviews)</span>
        </div>
      </div>

      <div className="product-price-section">
        <span className="current-price">{formatPrice(product.price)}</span>
       
      </div>

      <p className="product-description">{product.description}</p>

      <div className="product-features">
        <h3>Key Features</h3>
        <ul className="features-list">
          {product.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>

      <div className="product-actions">
        <button className="primary-button">Add to Cart</button>
        <button className="secondary-button">
          <Heart size={20} />
          Add to Wishlist
        </button>
      </div>

      <div className="product-guarantees">
        <div className="guarantee-item">
          <Truck size={24} />
          <div>
            <h4>Free Shipping</h4>
            <p>On orders over $100</p>
          </div>
        </div>
        <div className="guarantee-item">
          <Shield size={24} />
          <div>
            <h4>2 Year Warranty</h4>
            <p>Money back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
}