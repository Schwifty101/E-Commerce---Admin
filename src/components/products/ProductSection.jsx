import React from 'react';
import { ProductCard } from './ProductCard';

export function ProductSection({ title, products, onProductClick, sortBy, onSortChange }) {
  return (
    <section className="product-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <select 
          className="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Highest Rated</option>
        </select>
      </div>
      <div className="products-grid">
        {products?.map((product) => (
          <ProductCard 
            key={product._id} 
            product={product} 
            onProductClick={onProductClick}
          />
        ))}
      </div>
    </section>
  );
}