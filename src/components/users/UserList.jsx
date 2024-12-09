import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import Table from '../common/Table';
import { formatDate } from '../../utils/dateUtils';

const UserList = ({ 
  users, 
  onUserClick, 
  actions,
  pageSize = 10,
  currentPage,
  onPageChange,
  isLoading 
}) => {
  const paginatedUsers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return users.slice(startIndex, endIndex);
  }, [users, currentPage, pageSize]);

  const totalPages = Math.ceil(users.length / pageSize);

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
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Role',
        accessor: 'role',
        Cell: ({ value }) => (
          <span className="capitalize">{value}</span>
        ),
      },
      {
        Header: 'Created At',
        accessor: 'createdAt',
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: 'Last Login',
        accessor: 'updatedAt',
        Cell: ({ value }) => {
          if (!value) return '-';
          const date = parseISO(value);
          return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm') : 'Invalid date';
        }
      },
      {
        Header: 'Verification Status',
        accessor: 'verificationStatus',
        Cell: ({ value }) => (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
              ${value === 'active' ? 'bg-green-100 text-green-800' :
              value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'}`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => actions(row.original)
      }
    ],
    [actions]
  );

  return (
    <div>
      <Table 
        columns={columns} 
        data={paginatedUsers} 
        onRowClick={onUserClick}
        pagination={{
          pageIndex: currentPage - 1,
          pageSize,
          pageCount: totalPages,
          onPageChange: ({ pageIndex }) => onPageChange(pageIndex + 1)
        }}
        isLoading={isLoading}
      />
      
      <div className="mt-4 flex items-center justify-between px-4">
        <div className="text-sm text-gray-500">
          {users.length > 0 ? (
            <span>
              Showing {Math.min((currentPage - 1) * pageSize + 1, users.length)} - {Math.min(currentPage * pageSize, users.length)} of {users.length} users
            </span>
          ) : (
            <span>No users found</span>
          )}
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
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className={`px-4 py-2 text-sm font-medium rounded-md
              ${currentPage >= totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserList;