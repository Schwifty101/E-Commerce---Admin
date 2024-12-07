import { useState, useEffect } from 'react';

// Sample data - replace with actual API call
const sampleCurrentOrders = [
  {
    id: 1,
    date: '2024-03-20',
    title: 'Gaming Laptop Pro',
    description: 'High-performance gaming laptop with RTX 4080',
    price: 1999.99,
    image: 'https://picsum.photos/200/300',
    sellerName: 'Gaming Tech Ltd',
    status: 'in_process'
  },
  {
    id: 2,
    date: '2024-03-19',
    title: 'Wireless Earbuds',
    description: 'Premium wireless earbuds with noise cancellation',
    price: 199.99,
    image: 'https://picsum.photos/200/300',
    sellerName: 'Audio Plus',
    status: 'on_the_way'
  }
];

export function useCurrentOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(sampleCurrentOrders);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load current orders');
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, isLoading, error };
}