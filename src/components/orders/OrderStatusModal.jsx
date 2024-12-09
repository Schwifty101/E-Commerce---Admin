import React, { useState } from 'react';
import Modal from '../common/Modal';
import { AlertCircle, CheckCircle2, Truck, Package, XCircle } from 'lucide-react';

const OrderStatusModal = ({ isOpen, onClose, order, onUpdateStatus }) => {
  const [status, setStatus] = useState(order?.status || 'pending');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onUpdateStatus(order.id, {
        status,
        comment,
        updatedAt: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: AlertCircle, color: 'text-purple-500' },
    { value: 'processing', label: 'Processing', icon: Package, color: 'text-yellow-500' },
    { value: 'shipped', label: 'Shipped', icon: Truck, color: 'text-blue-500' },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-green-500' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-500' }
  ];

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'pending': return 'border-purple-200 bg-purple-50';
      case 'processing': return 'border-yellow-200 bg-yellow-50';
      case 'shipped': return 'border-blue-200 bg-blue-50';
      case 'delivered': return 'border-green-200 bg-green-50';
      case 'cancelled': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Update Order Status"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors
                    ${status === option.value ? getStatusColor(option.value) : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={status === option.value}
                    onChange={(e) => setStatus(e.target.value)}
                    className="sr-only"
                  />
                  <Icon className={`w-5 h-5 mr-2 ${option.color}`} />
                  <span className="text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
              placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Add a comment about this status update..."
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 
              bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white 
              bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
              disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OrderStatusModal; 