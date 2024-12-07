import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';
import { BuyerHomePage } from './buyerHomePage';
import { ProductDetailPage } from './ProductDetailPage';
import CartPage from './CartPage';  
import '../styling/Header.css'
import { ProfilePage } from './BuyerProfilePage';
import {CurrentOrdersPage} from './BuyerCurrentOrdersPage'

export function BuyerMain() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const navigateToProduct = (productId) => {
    setSelectedProductId(productId);
    setCurrentPage('product');
  };
  const navigateToCart = () => {
    setCurrentPage('cart');
  };
  const navigateToProfile = () => {
    setCurrentPage('profile');
  };
  const navigateToOrders = () => {
    setCurrentPage('orders');
  };

  const handleSearch = async (searchTerm) => {
    try {
      setSearchError(null);
      const token = localStorage.getItem('token'); // Get token from localStorage
      const response = await fetch(`http://127.0.0.1:3000/api/users/products/search?q=${searchTerm}`
        , {
          method: 'GET', // Specify the method if required
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from server');
      }

      const data = await response.json();
      setSearchResults(data);
      setCurrentPage('home');
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchError('Failed to search products. Please try again later.');
      setSearchResults(null);
    }
  };

  return (
    <div className="app-container">
      <Header 
        onCartClick={navigateToCart} 
        onUserClick={navigateToProfile} 
        onPackageClick={navigateToOrders} 
        onSearch={handleSearch}
      />
      <div className='page'>
      {currentPage === 'home' ? (
        <BuyerHomePage 
          onProductClick={navigateToProduct} 
          searchResults={searchResults}
          searchError={searchError}
        />
      ) : currentPage === 'product' ?  (
        <ProductDetailPage 
          productId={selectedProductId} 
          onBack={() => setCurrentPage('home')} 
        />
      ): currentPage === 'profile' ? (
        <ProfilePage onBack={() => setCurrentPage('home')} />
      ) : currentPage === 'orders' ? (
        <CurrentOrdersPage onBack={() => setCurrentPage('home')} />
      ) :
      (
        <CartPage onBack={() => setCurrentPage('home')} />
      )
      }
      </div> 
      <Footer />
    </div>
  );
}

// Mount the app
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <BuyerMain />
    </React.StrictMode>
  );
}
