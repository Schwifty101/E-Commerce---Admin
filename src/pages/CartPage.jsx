import React, { useState } from 'react';
import CartItem from '../components/Cart/CartItem';
import CheckoutForm from '../components/Cart/CheckoutForm';
import OrderConfirmation from '../components/Cart/OrderConfirmation';
import '../styling/cart.css'
// Sample data - replace with your actual data source
const initialItems = [
  {
    id: 1,
    title: "Smartphone",
    price: 699.99,
    image: "https://picsum.photos/200/300",
    quantity: 1
  },
  {
    id: 2,
    title: "Laptop",
    price: 1299.99,
    image: "https://picsum.photos/200/300",
    quantity: 1
  },
  {
    id: 3,
    title: "Headphones",
    price: 199.99,
    image: "https://picsum.photos/200/300",
    quantity: 1
  }
];

function CartPage({ onBack }) {
  const [items, setItems] = useState(initialItems);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  const handleQuantityChange = (itemId, newQuantity) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
  };

  const handleConfirmOrder = (formData) => {
    // Here you would typically send the order to your backend
    console.log('Order confirmed:', { items, formData });
    setIsOrderConfirmed(true);
  };

  const handleBack = () => {
    if (isOrderConfirmed) {
      setIsOrderConfirmed(false);
      setIsCheckingOut(false);
      // Optionally reset the cart here
      setItems(initialItems);
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

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button onClick={onBack} className="back-button">
          Back to Home
        </button>
        <h1>Your Cart</h1>
      </div>
      <div className="cart-items">
        {items.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={handleQuantityChange}
          />
        ))}
      </div>
      <button onClick={handleCheckout} className="checkout-button">
        Proceed to Checkout
      </button>
    </div>
  );
}

export default CartPage;