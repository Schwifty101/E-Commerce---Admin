import React from 'react';
import { Order } from '../../types';

interface OrderFormProps {
  order?: Order;
  onSubmit: (data: Partial<Order>) => void;
  onCancel: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ order, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState({
    customerName: order?.customerName || '',
    status: order?.status || 'pending',
    paymentStatus: order?.paymentStatus || 'pending',
    shippingAddress: order?.shippingAddress || '',
    items: order?.items || [],
    total: order?.total || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
          Customer Name
        </label>
        <input
          type="text"
          id="customerName"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Order Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as Order['status'] })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div>
        <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
          Payment Status
        </label>
        <select
          id="paymentStatus"
          value={formData.paymentStatus}
          onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as Order['paymentStatus'] })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div>
        <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700">
          Shipping Address
        </label>
        <textarea
          id="shippingAddress"
          value={formData.shippingAddress}
          onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="total" className="block text-sm font-medium text-gray-700">
          Total Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="total"
            min="0"
            step="0.01"
            value={formData.total}
            onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) })}
            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {order ? 'Update Order' : 'Create Order'}
        </button>
      </div>
    </form>
  );
};

export default OrderForm;