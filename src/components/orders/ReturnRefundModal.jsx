import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

const ReturnRefundModal = ({ isOpen, onClose, request, onAction }) => {
  const [comment, setComment] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => {
    // Reset form when request changes
    if (request) {
      setAction('');
      setComment('');
    }
  }, [request]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!action) {
      toast.error('Please select an action');
      return;
    }
    onAction(request, action, comment);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Review Return/Refund Request"
    >
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Request Details</h3>
          <div className="mt-2 space-y-2">
            <p>
              <span className="font-medium">Order Number:</span> {request?.orderNumber || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Customer:</span> {request?.customer?.name || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Type:</span> {request?.returnRequest?.reason || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Status:</span> {request?.returnRequest?.status || 'Pending'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="action" className="block text-sm font-medium text-gray-700">Action</label>
            <select
              id="action"
              name="action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select action...</option>
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
              <option value="escalated">Escalate</option>
            </select>
          </div>

          <div>
            <label htmlFor="adminComments" className="block text-sm font-medium text-gray-700">Admin Comments</label>
            <textarea
              id="adminComments"
              name="adminComments"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              placeholder="Add your comments..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Submit Decision
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ReturnRefundModal;
