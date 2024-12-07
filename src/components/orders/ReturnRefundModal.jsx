import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

const ReturnRefundModal = ({ isOpen, onClose, request, onAction }) => {
  const [comment, setComment] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => {
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

    if (!comment.trim()) {
      toast.error('Please provide comments');
      return;
    }

    // Validate request exists and status
    if (!request?.returnRequest) {
      toast.error('Invalid return request');
      return;
    }

    // Prevent actions on already processed requests
    if (request.returnRequest.status === 'approved' || request.returnRequest.status === 'rejected') {
      toast.error(`Cannot modify a request that is already ${request.returnRequest.status}`);
      return;
    }

    onAction(request, action, comment);
  };

  // Disable the form if request is already processed
  const isProcessed = request?.returnRequest?.status === 'approved' || 
                     request?.returnRequest?.status === 'rejected';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Review Return/Refund Request"
    >
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Request Details</h3>
          <div className="space-y-3">
            <p>
              <span className="font-medium">Order Number:</span> {request?.orderNumber}
            </p>
            <p>
              <span className="font-medium">Customer:</span> {request?.customer?.name}
            </p>
            <p>
              <span className="font-medium">Reason:</span> {request?.returnRequest?.reason}
            </p>
            <p>
              <span className="font-medium">Status:</span> {request?.returnRequest?.status || 'Pending'}
            </p>
          </div>
        </div>

        {isProcessed ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">
              This request has already been {request?.returnRequest?.status}. No further actions can be taken.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700">Action</label>
              <select
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isProcessed}
              >
                <option value="">Select action...</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="escalate">Escalate</option>
              </select>
            </div>

            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700">Comments</label>
              <textarea
                id="comments"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Add your comments..."
                required
                disabled={isProcessed}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {!isProcessed && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Submit Decision
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ReturnRefundModal;
