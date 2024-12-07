import { mockProducts } from '../data/mockData';

export function findProductById(id) {
  const allProducts = [
    ...mockProducts.popular,
    ...mockProducts.recommended,
    ...mockProducts.pastSellers
  ];
  
  const product = allProducts.find(p => p.id === id);
  
  if (product) {
    // Enhance product with additional details for the product page
    return {
      ...product,
      images: [
        product.image,
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80'
      ],
      rating: 4.5,
      reviews: [
        { id: 1, user: 'John D.', rating: 5, comment: 'Excellent product!' },
        { id: 2, user: 'Sarah M.', rating: 4, comment: 'Good value for money.' }
      ],
      features: [
        'High-quality build',
        'Premium materials',
        '1-year warranty',
        'Free shipping'
      ]
    };
  }
  
  return null;
}