import React from 'react';
import { Order } from '../../types';
import Table from '../common/Table';
import { format } from 'date-fns';

interface OrderListProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onOrderClick }) => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Order ID',
        accessor: 'id',
        Cell: ({ value }: { value: string }) => `#${value}`,
      },
      {
        Header: 'Customer',
        accessor: 'customerName',
      },
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }: { value: string }) => format(new Date(value), 'MMM dd, yyyy'),
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }: { value: string }) => (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
              ${value === 'delivered' ? 'bg-green-100 text-green-800' :
              value === 'shipped' ? 'bg-blue-100 text-blue-800' :
              value === 'processing' ? 'bg-yellow-100 text-yellow-800' :
              value === 'cancelled' ? 'bg-red-100 text-red-800' :
              value === 'refunded' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'}`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: 'Payment',
        accessor: 'paymentStatus',
        Cell: ({ value }: { value: string }) => (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
              ${value === 'paid' ? 'bg-green-100 text-green-800' :
              value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'}`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: 'Total',
        accessor: 'total',
        Cell: ({ value }: { value: number }) => `$${value.toFixed(2)}`,
      },
    ],
    []
  );

  return <Table columns={columns} data={orders} onRowClick={onOrderClick} />;
};

export default OrderList;