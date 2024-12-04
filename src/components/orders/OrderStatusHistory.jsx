import React from 'react';
import { format } from 'date-fns';

const OrderStatusHistory = ({ statusUpdates }) => {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {statusUpdates.map((update, idx) => (
          <li key={update.updatedAt}>
            <div className="relative pb-8">
              {idx !== statusUpdates.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                    ${update.status === 'delivered' ? 'bg-green-500' :
                      update.status === 'shipped' ? 'bg-blue-500' :
                      update.status === 'processing' ? 'bg-yellow-500' :
                      update.status === 'cancelled' ? 'bg-red-500' :
                      'bg-gray-500'}`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      Status changed to <span className="font-medium text-gray-900">{update.status}</span>
                    </p>
                    {update.comment && (
                      <p className="mt-1 text-sm text-gray-500">{update.comment}</p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={update.updatedAt}>
                      {format(new Date(update.updatedAt), 'MMM d, yyyy HH:mm')}
                    </time>
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