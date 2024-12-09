import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const ReturnRefundModal = ({ isOpen, onClose, request, onAction }) => {
  const [comment, setComment] = useState('');
  const [action, setAction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      setAction('');
      setComment('');
    }
  }, [request]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!action) {
      toast.error('Please select an action');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please provide comments');
      return;
    }

    if (!request?.returnRequest) {
      toast.error('Invalid return request');
      return;
    }

    if (request.returnRequest.status === 'approved' || request.returnRequest.status === 'rejected') {
      toast.error(`Cannot modify a request that is already ${request.returnRequest.status}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onAction(request, action, comment);
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error('Failed to process request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionOptions = [
    { value: 'approve', label: 'Approve', icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
    { value: 'reject', label: 'Reject', icon: XCircle, color: 'text-red-500 bg-red-50' },
    { value: 'escalate', label: 'Escalate', icon: AlertTriangle, color: 'text-yellow-500 bg-yellow-50' }
  ];

  const isProcessed = request?.returnRequest?.status === 'approved' || 
                     request?.returnRequest?.status === 'rejected';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Review Return/Refund Request"
      size="lg"
    >
      <div className="space-y-6 p-6">
        {/* Request Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Order Number:</span>
              <p className="mt-1 text-gray-900">#{request?.orderNumber}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Customer:</span>
              <p className="mt-1 text-gray-900">{request?.customer?.name}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-500">Reason:</span>
              <p className="mt-1 text-gray-900">{request?.returnRequest?.reason}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                ${request?.returnRequest?.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request?.returnRequest?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  request?.returnRequest?.status === 'escalated' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'}`}
              >
                {request?.returnRequest?.status || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {isProcessed ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Request Already Processed
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  This request has already been {request?.returnRequest?.status}. No further actions can be taken.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Action Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Action
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {actionOptions.map(({ value, label, icon: Icon, color }) => (
                  <label
                    key={value}
                    className={`relative flex items-center p-4 cursor-pointer rounded-lg border
                      ${action === value ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'}
                      hover:bg-gray-50 transition-colors`}
                  >
                    <input
                      type="radio"
                      name="action"
                      value={value}
                      checked={action === value}
                      onChange={(e) => setAction(e.target.value)}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-2 ${color}`} />
                      <span className="text-sm font-medium text-gray-900">{label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                Comments
              </label>
              <textarea
                id="comments"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-lg border-gray-300 shadow-sm 
                  focus:border-blue-500 focus:ring-blue-500/20
                  disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Add your comments about this decision..."
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 
                  bg-white border border-gray-300 rounded-lg shadow-sm 
                  hover:bg-gray-50 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white 
                  bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-blue-500 disabled:bg-blue-400"
              >
                {isSubmitting ? 'Processing...' : 'Submit Decision'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ReturnRefundModal;
