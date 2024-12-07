import React from 'react';
import { Link } from 'react-router-dom';

export function ProductCard({ product , onProductClick}) {
  console.log('Product in card:', product);
  if (!product) return null;

  return (
   <div className="product-card" 
   onClick={() => onProductClick(product._id)}
   role="button"
   tabIndex={0}>
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-content">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price}</span>
        </div>
      </div>
      </div>
    
  );
}

