import React from 'react';
import { Order } from '../types';
import OrderList from '../components/orders/OrderList';
import OrderForm from '../components/orders/OrderForm';
import OrderDetails from '../components/orders/OrderDetails';
import Modal from '../components/common/Modal';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: '1',
    customerName: 'John Doe',
    date: '2024-03-15T10:30:00Z',
    status: 'delivered',
    total: 156.00,
    items: [
      {
        productId: '1',
        name: 'Wireless Headphones',
        quantity: 1,
        price: 99.99
      },
      {
        productId: '2',
        name: 'Phone Case',
        quantity: 2,
        price: 28.00
      }
    ],
    shippingAddress: '123 Main St, Anytown, ST 12345',
    paymentStatus: 'paid'
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    date: '2024-03-14T15:45:00Z',
    status: 'processing',
    total: 234.50,
    items: [
      {
        productId: '3',
        name: 'Smart Watch',
        quantity: 1,
        price: 199.99
      },
      {
        productId: '4',
        name: 'Watch Band',
        quantity: 1,
        price: 34.51
      }
    ],
    shippingAddress: '456 Oak Ave, Somewhere, ST 67890',
    paymentStatus: 'pending'
  }
];

const OrderManagement = () => {
  const [orders, setOrders] = React.useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'create' | 'edit' | 'view'>('create');

  const handleCreateOrder = (orderData: Partial<Order>) => {
    const newOrder: Order = {
      id: String(orders.length + 1),
      date: new Date().toISOString(),
      ...orderData,
    } as Order;

    setOrders([...orders, newOrder]);
    setIsModalOpen(false);
    toast.success('Order created successfully');
  };

  const handleUpdateOrder = (orderData: Partial<Order>) => {
    if (!selectedOrder) return;

    const updatedOrders = orders.map((order) =>
      order.id === selectedOrder.id ? { ...order, ...orderData } : order
    );

    setOrders(updatedOrders);
    setSelectedOrder(null);
    setIsModalOpen(false);
    toast.success('Order updated successfully');
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create':
        return 'Create Order';
      case 'edit':
        return 'Edit Order';
      case 'view':
        return 'Order Details';
      default:
        return '';
    }
  };

  const getModalContent = () => {
    switch (modalMode) {
      case 'create':
      case 'edit':
        return (
          <OrderForm
            order={modalMode === 'edit' ? selectedOrder || undefined : undefined}
            onSubmit={modalMode === 'edit' ? handleUpdateOrder : handleCreateOrder}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedOrder(null);
            }}
          />
        );
      case 'view':
        return selectedOrder ? (
          <div>
            <OrderDetails order={selectedOrder} />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setModalMode('edit');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit Order
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <button
          onClick={() => {
            setSelectedOrder(null);
            setModalMode('create');
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Order
        </button>
      </div>

      <OrderList orders={orders} onOrderClick={handleOrderClick} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        title={getModalTitle()}
      >
        {getModalContent()}
      </Modal>
    </div>
  );
};

export default OrderManagement;