import React, { useState } from 'react';

function CheckoutForm({ items, onConfirm, onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    shippingAddress: '',
    paymentMethod: 'credit_card',
  });

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!items.length || !items[0].seller) {
        throw new Error('Invalid vendor information');
      }

      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        vendor: items[0].seller,
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
        customerName: formData.name,
        customerEmail: formData.email
      };

      await onConfirm(orderData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="checkout-form">
      <h2>Checkout Details</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Shipping Address:</label>
          <textarea
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Payment Method:</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        <div className="total-price">
          <h3>Total Price: ${totalPrice.toFixed(2)}</h3>
        </div>
        
        <div className="button-group">
          <button 
            type="button" 
            onClick={onBack} 
            className="back-button"
            disabled={isSubmitting}
          >
            Back to Cart
          </button>
          <button 
            type="submit" 
            className="confirm-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CheckoutForm;