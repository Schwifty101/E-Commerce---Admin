import React, { useState } from 'react';
import Table from '../common/Table';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const OrderList = ({ orders, onOrderClick, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Filter orders based on search term and status
  const filteredOrders = orders?.filter(order =>
    (!searchTerm ||
      (order?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order?.orderNumber?.toString().toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (!statusFilter || order?.status === statusFilter)
  ) || [];

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Add these handler functions
  const handlePrevious = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNext = () => {
    handlePageChange(currentPage + 1);
  };

  // Add these calculations for the results display
  const startResult = indexOfFirstOrder + 1;
  const endResult = Math.min(indexOfLastOrder, filteredOrders.length);
  const totalResults = filteredOrders.length;

  // Define table columns
  const columns = React.useMemo(
    () => [
      {
        Header: 'Order ID',
        accessor: 'orderNumber',
        Cell: ({ value }) => (
          <span className="font-medium text-gray-900">#{value || 'N/A'}</span>
        ),
      },
      {
        Header: 'Customer',
        accessor: row => row.customer?.name,
        id: 'customerName',
        Cell: ({ row, value }) => (
          <div className="flex flex-col">
            <span className="text-gray-900">{value || 'N/A'}</span>
            {value && (
              <span className="text-xs text-gray-500">
                {row.original.customer?.email || 'No email'}
              </span>
            )}
          </div>
        ),
      },
      {
        Header: 'Date',
        accessor: 'createdAt',
        Cell: ({ value }) => {
          if (!value) return 'N/A';
          try {
            const date = new Date(value);
            return isNaN(date.getTime()) ? 'N/A' : (
              <div className="flex flex-col">
                <span className="text-gray-900">{format(date, 'MMM dd, yyyy')}</span>
                <span className="text-xs text-gray-500">{format(date, 'HH:mm')}</span>
              </div>
            );
          } catch (error) {
            console.error('Date formatting error:', error);
            return 'N/A';
          }
        },
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
              ${value === 'delivered' ? 'bg-green-100 text-green-800' :
                value === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  value === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    value === 'cancelled' ? 'bg-red-100 text-red-800' :
                      value === 'returned' ? 'bg-gray-100 text-gray-800' :
                        value === 'pending' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'}`}
          >
            {value || 'N/A'}
          </span>
        ),
      },
      {
        Header: 'Payment',
        accessor: 'paymentStatus',
        Cell: ({ value }) => (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
              ${value === 'paid' ? 'bg-green-100 text-green-800' :
                value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  value === 'failed' ? 'bg-red-100 text-red-800' :
                    value === 'refunded' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'}`}
          >
            {value || 'N/A'}
          </span>
        ),
      },
      {
        Header: 'Total',
        accessor: 'total',
        Cell: ({ value }) => value ? `$${Number(value).toFixed(2)}` : 'N/A',
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search by customer or order ID"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
        <option value="returned">Returned</option>
      </select>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          <Table
            columns={columns}
            data={currentOrders}
            onRowClick={onOrderClick}
          />

          {/* Updated pagination section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 bg-white border-t border-gray-200">
            {/* Results Counter - Responsive */}
            <div className="text-sm text-gray-700 order-2 sm:order-1 text-center sm:text-left">
              <span className="hidden sm:inline">Showing </span>
              <span className="font-medium">{startResult}</span>
              <span className="hidden sm:inline"> to </span>
              <span className="sm:hidden">-</span>
              <span className="font-medium">{endResult}</span>
              <span className="hidden sm:inline"> of </span>
              <span className="sm:hidden">/</span>
              <span className="font-medium">{totalResults}</span>
              <span className="hidden sm:inline"> results</span>
            </div>

            {/* Pagination Controls - Responsive */}
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`inline-flex items-center px-2 sm:px-3 py-2 text-sm font-medium 
                  rounded-lg transition-colors focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-blue-500
                  ${currentPage === 1
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
              >
                <ChevronLeft className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <span className="hidden sm:inline">Page</span>
                <span className="font-medium">{currentPage}</span>
                <span>/</span>
                <span className="font-medium">{totalPages}</span>
              </div>
              
              <button
                onClick={handleNext}
                disabled={currentPage >= totalPages}
                className={`inline-flex items-center px-2 sm:px-3 py-2 text-sm font-medium 
                  rounded-lg transition-colors focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-blue-500
                  ${currentPage >= totalPages
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 sm:ml-1" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderList;