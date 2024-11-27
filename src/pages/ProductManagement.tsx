import React from 'react';
import { Product } from '../types';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import Modal from '../components/common/Modal';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    stock: 45,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
    status: 'approved',
    seller: 'Tech Gadgets Inc',
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 199.99,
    stock: 8,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200',
    status: 'pending',
    seller: 'WearTech Solutions',
    createdAt: '2024-03-10T00:00:00Z',
  },
  {
    id: '3',
    name: 'Leather Backpack',
    price: 79.99,
    stock: 23,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
    status: 'flagged',
    seller: 'Fashion Outlet',
    createdAt: '2024-03-15T00:00:00Z',
  },
];

const ProductManagement = () => {
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleCreateProduct = (productData: Partial<Product>) => {
    const newProduct: Product = {
      id: String(products.length + 1),
      ...productData,
      createdAt: new Date().toISOString(),
    } as Product;

    setProducts([...products, newProduct]);
    setIsModalOpen(false);
    toast.success('Product created successfully');
  };

  const handleUpdateProduct = (productData: Partial<Product>) => {
    if (!selectedProduct) return;

    const updatedProducts = products.map((product) =>
      product.id === selectedProduct.id ? { ...product, ...productData } : product
    );

    setProducts(updatedProducts);
    setSelectedProduct(null);
    setIsModalOpen(false);
    toast.success('Product updated successfully');
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      <ProductList products={products} onProductClick={handleProductClick} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        title={selectedProduct ? 'Edit Product' : 'Create Product'}
      >
        <ProductForm
          product={selectedProduct || undefined}
          onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default ProductManagement;