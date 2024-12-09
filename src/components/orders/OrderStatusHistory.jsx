import React from 'react';
import { format, isValid, parseISO } from 'date-fns';

const OrderStatusHistory = ({ statusUpdates = [], statusLogs = [] }) => {
  // Use statusLogs if provided, otherwise fall back to statusUpdates
  const updates = statusLogs.length > 0 ? statusLogs : statusUpdates;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    
    try {
      const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
      return isValid(date) ? format(date, 'MMM d, yyyy HH:mm') : 'Invalid date';
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'returned':
        return 'bg-purple-500';
      case 'refunded':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!Array.isArray(updates) || updates.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No status updates available
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {updates.map((update, idx) => (
          <li key={`${update.timestamp || update.updatedAt || idx}`}>
            <div className="relative pb-8">
              {idx !== updates.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusColor(update.status)}`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm leading-6">
                    <span className="font-medium text-gray-900">
                      Status changed to{' '}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${update.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          update.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          update.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          update.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          update.status === 'returned' || update.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {update.status}
                      </span>
                    </span>
                    {update.comment && (
                      <p className="mt-1 text-gray-500">{update.comment}</p>
                    )}
                    <p className="mt-0.5 text-sm text-gray-500">
                      {formatDate(update.timestamp || update.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderStatusHistory; 