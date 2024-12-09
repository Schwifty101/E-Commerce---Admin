import React, { useState } from 'react';
import Table from '../common/Table';
import { format } from 'date-fns';

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
        Cell: ({ value }) => `#${value || 'N/A'}`,
      },
      {
        Header: 'Customer',
        accessor: row => row.customer?.name,
        id: 'customerName',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'Date',
        accessor: 'createdAt',
        Cell: ({ value }) => {
          if (!value) return 'N/A';
          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              return 'N/A';
            }
            return format(date, 'MMM dd, yyyy');
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
          <div className="flex justify-between items-center px-2">
            <div className="text-sm text-gray-700">
              Showing {startResult} to {endResult} of {totalResults} results
            </div>
            
            <div className="flex items-center space-x-2">
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
              
              <span className="text-sm text-gray-700">
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
        </>
      )}
    </div>
  );
};

export default OrderList;