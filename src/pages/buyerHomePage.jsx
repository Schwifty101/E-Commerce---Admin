import React, { useState } from 'react';

import { HeroSection } from '../components/Hero/HeroSection';
import { ProductSection } from '../components/Products/ProductSection';

import { mockProducts } from '../data/mockData';
import '../styling/global.css';
import '../styling/Header.css';
import '../styling/Hero.css';
import '../styling/ProductCard.css';
import '../styling/ProductSection.css';
import '../styling/Footer.css';



function BuyerHomePage({ onProductClick, searchResults }) {
  const [sortBy, setSortBy] = useState('default');
  const [allProducts, setAllProducts] = useState(null);

  const handleShopNowClick = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:3000/api/users/products/getallproducts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error('Error fetching all products:', error);
    }
  };

  const sortProducts = (products) => {
    if (!products) return [];
    const sortedProducts = [...products];
    
    switch (sortBy) {
      case 'price-asc':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'rating-desc':
        return sortedProducts.sort((a, b) => b.rating - a.rating);
      default:
        return sortedProducts;
    }
  };

  return (
    <>
      {!searchResults && !allProducts && (
        <HeroSection onShopNowClick={handleShopNowClick} />
      )}
      <main className="main-content">
        {searchResults ? (
          <ProductSection 
            title="Search Results" 
            products={sortProducts(searchResults)}
            onProductClick={onProductClick}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        ) : allProducts ? (
          <ProductSection 
            title="All Products" 
            products={sortProducts(allProducts)}
            onProductClick={onProductClick}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        ) : (
          <>
            <ProductSection 
              title="Most Popular This Week" 
              products={sortProducts(mockProducts.popular)}
              onProductClick={onProductClick}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
            <ProductSection 
              title="Recommended For You" 
              products={sortProducts(mockProducts.recommended)}
              onProductClick={onProductClick}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
            <ProductSection 
              title="From Your Past Sellers" 
              products={sortProducts(mockProducts.pastSellers)}
              onProductClick={onProductClick}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </>
        )}
      </main>
    </>
  );
}




export {BuyerHomePage};
