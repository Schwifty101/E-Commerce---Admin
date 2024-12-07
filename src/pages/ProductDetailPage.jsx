import React, { useState, useEffect } from 'react';
import { ProductGallery } from '../components/Products/ProductGallery';
import { ProductInfo } from '../components/Products/ProductInfo';

import '../styling/ProductDetail.css';

function ProductDetailPage({ productId, onBack }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching product with ID:', productId);

        const response = await fetch(`http://127.0.0.1:3000/api/users/products/getProduct/${productId}?populate=true`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Error response:', errorData);
          throw new Error(`Failed to fetch product details: ${errorData}`);
        }

        const data = await response.json();
        console.log('Received product data:', data);
        setProduct(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    } else {
      setLoading(false);
    }
    window.scrollTo(0, 0);
  }, [productId]);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return <div className="container">Error: {error}</div>;
  }

  if (!product) {
    return <div className="container">Product not found</div>;
  }

  return (
    <div className="product-detail-page">
      <button onClick={onBack}>Back</button>
      <div className="container">
        <div className="product-detail-grid">
          <ProductGallery images={product.images} />
          <ProductInfo product={product} />
        </div>
      </div>
    </div>
  );
}

export { ProductDetailPage };