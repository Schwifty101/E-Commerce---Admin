import React from 'react';
import Table from '../common/Table';
import { format } from 'date-fns';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'; // Import icons

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
  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage, pageSize]);

  const totalPages = Math.ceil(products.length / pageSize);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Product',
        accessor: 'name',
        Cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-12 w-12">
              <img
                src={row.original.image}
                alt={row.original.name}
                className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-product.png';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                {row.original.name}
              </div>
              <div className="text-sm text-gray-500 truncate">
                SKU: {row.original.sku || 'N/A'}
              </div>
            </div>
          </div>
        ),
      },
      {
        Header: 'Price',
        accessor: 'price',
        Cell: ({ value }) => (
          <span className="text-sm font-medium text-gray-900">
            ${value.toFixed(2)}
          </span>
        ),
      },
      {
        Header: 'Stock',
        accessor: 'stock',
        Cell: ({ value }) => (
          <span className={`text-sm font-medium
            ${value < 10 ? 'text-red-600' : 'text-gray-900'}`}
          >
            {value} units
          </span>
        ),
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => {
          const statusStyles = {
            approved: 'bg-green-50 text-green-700 border-green-200',
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            flagged: 'bg-orange-50 text-orange-700 border-orange-200',
            rejected: 'bg-red-50 text-red-700 border-red-200'
          };

          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              border ${statusStyles[value] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
          );
        },
      },
      {
        Header: 'Reports',
        accessor: 'reports',
        Cell: ({ value }) => value?.length > 0 && (
          <div className="flex items-center space-x-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">
              {value.length}
            </span>
          </div>
        ),
      },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProductClick(row.original);
              }}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium
                rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/20
                transition-colors duration-200"
            >
              View Details
            </button>
            {/* Render action buttons based on status */}
            {row.original.status === 'pending' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(row.original);
                  }}
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium
                    rounded-lg bg-green-50 text-green-700 hover:bg-green-100
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500/20
                    transition-colors duration-200"
                >
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(row.original);
                  }}
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium
                    rounded-lg bg-red-50 text-red-700 hover:bg-red-100
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/20
                    transition-colors duration-200"
                >
                  Reject
                </button>
              </>
            )}
            {/* Additional action buttons for other statuses */}
          </div>
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
      <div className="overflow-x-auto">
        <Table 
          columns={columns} 
          data={paginatedProducts}
          className="min-w-full"
        />
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
              ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
              ${currentPage >= totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
          >
            Next
          </button>
        </div>

        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, products.length)}</span>
              {' '}-{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, products.length)}</span>
              {' '}of{' '}
              <span className="font-medium">{products.length}</span> products
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                ${currentPage >= totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;