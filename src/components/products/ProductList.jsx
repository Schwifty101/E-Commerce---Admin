import React from 'react';
import Table from '../common/Table';
import { format } from 'date-fns';

const ProductList = ({ products, onProductClick }) => {
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
      },
      {
        Header: 'Created At',
        accessor: 'createdAt',
        Cell: ({ value }) => format(new Date(value), 'MMM dd, yyyy'),
      },
    ],
    []
  );

  return <Table columns={columns} data={products} onRowClick={onProductClick} />;
};

export default ProductList;