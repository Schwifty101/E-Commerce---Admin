import { useState, useEffect } from 'react';

const sampleOrders = [
  {
    id: 1,
    date: '2024-03-15',
    title: 'Smartphone XYZ',
    description: 'Latest model smartphone with 256GB storage',
    price: 799.99,
    image: 'https://picsum.photos/200/300',
    sellerName: 'Tech Store Inc.'
  },
  {
    id: 2,
    date: '2024-03-10',
    title: 'Wireless Headphones',
    description: 'Premium noise-canceling headphones',
    price: 299.99,
    image: 'https://picsum.photos/200/300',
    sellerName: 'Audio World'
  }
];

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(sampleOrders);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load orders');
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, isLoading, error };
}