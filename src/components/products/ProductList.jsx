import React from 'react';
import Table from '../common/Table';
import { format } from 'date-fns';

const ProductList = ({ 
  products, 
  loading, 
  onProductClick, 
  onApprove, 
  onReject, 
  onEscalate, 
  onDelete,
  pageSize = 10,
  currentPage,
  onPageChange 
}) => {
  // Add pagination logic
  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage, pageSize]);

  const totalPages = Math.ceil(products.length / pageSize);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

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
        sortType: (rowA, rowB) => {
          const a = new Date(rowA.values.createdAt).getTime();
          const b = new Date(rowB.values.createdAt).getTime();
          return a > b ? 1 : -1;
        },
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

  return (
    <div className="space-y-4">
      <Table columns={columns} data={paginatedProducts} />
      
      {/* Pagination Controls */}
      <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between sm:hidden">
          {/* Mobile pagination controls */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {Math.min((currentPage - 1) * pageSize + 1, products.length)}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, products.length)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{products.length}</span>{' '}
              results
            </p>
          </div>
          
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm font-medium rounded-md
                ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className={`px-4 py-2 text-sm font-medium rounded-md
                ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;