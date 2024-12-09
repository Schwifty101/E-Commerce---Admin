import { useState, useEffect } from 'react';
import axios from 'axios';

export function useCurrentOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:3000/api/orders/getAllOrders/non-delivered', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrders(response.data.orders);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, isLoading, error };
}