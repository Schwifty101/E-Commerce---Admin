import React from 'react';
import { format } from 'date-fns';

const OrderDetails = ({ order }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Order Details</h3>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-900">
              <span className="font-medium">Order ID:</span> #{order.id}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Date:</span>{' '}
              {format(new Date(order.date), 'MMM dd, yyyy HH:mm')}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Status:</span>{' '}
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  order.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'}`}
              >
                {order.status}
              </span>
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-900">
              <span className="font-medium">Name:</span> {order.customerName}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Shipping Address:</span>
              <br />
              {order.shippingAddress}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">Order Items</h3>
        <div className="mt-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.productId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(item.quantity * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                  Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${order.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500">Payment Information</h3>
        <div className="mt-2">
          <p className="text-sm text-gray-900">
            <span className="font-medium">Payment Status:</span>{' '}
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'}`}
            >
              {order.paymentStatus}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;