import React from 'react';
import Table from '../common/Table';
import { format } from 'date-fns';

const ProductList = ({ products, loading, onProductClick, onApprove, onReject, onEscalate, onDelete }) => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Product',
        accessor: 'name',
        Cell: ({ row }) => (
          <div className="flex items-center">
            <img
              src={row.original.image}
              alt={row.original.name}
              className="h-10 w-10 rounded-md object-cover mr-3"
            />
            <span>{row.original.name}</span>
          </div>
        ),
      },
      {
        Header: 'Price',
        accessor: 'price',
        Cell: ({ value }) => `$${value.toFixed(2)}`,
      },
      {
        Header: 'Stock',
        accessor: 'stock',
        Cell: ({ value }) => (
          <span className={value < 10 ? 'text-red-600 font-medium' : ''}>
            {value} units
          </span>
        ),
      },
      {
        Header: 'Category',
        accessor: 'category',
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
              ${value === 'approved' ? 'bg-green-100 text-green-800' :
              value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              value === 'flagged' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'}`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: 'Seller',
        accessor: 'seller',
        Cell: ({ value }) => value?.name || value?.email || 'Unknown Seller',
      },
      {
        Header: 'Created At',
        accessor: 'createdAt',
        Cell: ({ value }) => format(new Date(value), 'MMM dd, yyyy'),
      },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProductClick(row.original);
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              View Details
            </button>
            {row.original.status === 'pending' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(row.original);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(row.original);
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                  Reject
                </button>
              </>
            )}
            {row.original.status === 'flagged' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEscalate(row.original);
                  }}
                  className="px-3 py-1 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700"
                >
                  Escalate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row.original);
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ),
      },
      {
        Header: 'Reports',
        accessor: 'reports',
        Cell: ({ value }) => value?.length > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            {value.length} reports
          </span>
        ),
      },
    ],
    [onApprove, onReject, onEscalate, onDelete, onProductClick]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <Table columns={columns} data={products} />;
};

export default ProductList;