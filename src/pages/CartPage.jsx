import React, { useState, useEffect } from 'react';
import CartItem from '../components/Cart/CartItem';
import CheckoutForm from '../components/Cart/CheckoutForm';
import OrderConfirmation from '../components/Cart/OrderConfirmation';
import '../styling/cart.css'

function CartPage({ onBack }) {
  const [items, setItems] = useState([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCartProducts();
  }, []);

  const fetchCartProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/users/displayCart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch cart items');
      
      const { data } = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    // You'll need to implement an API endpoint for updating quantity
    try {
      // Update locally first for immediate feedback
      setItems(items.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      ));
      
      // Then update on the server
      // await updateCartItemQuantity(productId, newQuantity);
    } catch (err) {
      // Revert on error
      fetchCartProducts();
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
  };

  const handleConfirmOrder = async (orderData) => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      setIsOrderConfirmed(true);
    } catch (err) {
      setError(err.message);
      throw err; // Propagate error back to CheckoutForm
    }
  };

  const handleBack = () => {
    if (isOrderConfirmed) {
      setIsOrderConfirmed(false);
      setIsCheckingOut(false);
      // Optionally reset the cart here
      setItems([]);
    } else if (isCheckingOut) {
      setIsCheckingOut(false);
    }
  };

  if (isOrderConfirmed) {
    return <OrderConfirmation onBack={handleBack} />;
  }

  if (isCheckingOut) {
    return <CheckoutForm items={items} onConfirm={handleConfirmOrder} onBack={handleBack} />;
  }

  if (isLoading) {
    return <div>Loading cart...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button onClick={onBack} className="back-button">
          Back to Home
        </button>
        <h1>Your Cart</h1>
      </div>
      <div className="cart-items">
        {items.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          items.map(item => (
            <CartItem
              key={item.productId}
              item={item}
              onQuantityChange={handleQuantityChange}
            />
          ))
        )}
      </div>
      {items.length > 0 && (
        <button onClick={handleCheckout} className="checkout-button">
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}

export default CartPage;