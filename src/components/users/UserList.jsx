import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import Table from '../common/Table';
import { formatDate } from '../../utils/dateUtils';
import { User } from 'lucide-react'; // Import icon for empty state

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

  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ value, row }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              {row.original.avatar ? (
                <img 
                  src={row.original.avatar} 
                  alt={value}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className="font-medium text-gray-900">{value}</span>
          </div>
        ),
      },
      {
        Header: 'Email',
        accessor: 'email',
        Cell: ({ value }) => (
          <span className="text-gray-600">{value}</span>
        ),
      },
      {
        Header: 'Role',
        accessor: 'role',
        Cell: ({ value }) => (
          <span className="capitalize px-2.5 py-1 rounded-full text-xs font-medium
            bg-gray-100 text-gray-800">
            {value}
          </span>
        ),
      },
      {
        Header: 'Created At',
        accessor: 'createdAt',
        Cell: ({ value }) => (
          <span className="text-gray-600">{formatDate(value)}</span>
        ),
      },
      {
        Header: 'Last Login',
        accessor: 'updatedAt',
        Cell: ({ value }) => {
          if (!value) return <span className="text-gray-400">Never</span>;
          const date = parseISO(value);
          return isValid(date) ? (
            <span className="text-gray-600">{format(date, 'MMM dd, yyyy HH:mm')}</span>
          ) : (
            <span className="text-gray-400">Invalid date</span>
          );
        }
      },
      {
        Header: 'Status',
        accessor: 'verificationStatus',
        Cell: ({ value }) => (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
              ${value === 'active' ? 'bg-green-100 text-green-800' :
              value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5
              ${value === 'active' ? 'bg-green-400' :
              value === 'pending' ? 'bg-yellow-400' :
              'bg-red-400'}`}
            />
            {value}
          </span>
        ),
      },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }) => actions(row.original)
      }
    ],
    [actions]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
      />
      
      {/* Pagination Info */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50 sm:px-6 rounded-b-lg">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
              ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
              ${currentPage >= totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              {users.length > 0 ? (
                <span>
                  Showing <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, users.length)}</span>
                  {' '}-{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, users.length)}</span>
                  {' '}of{' '}
                  <span className="font-medium">{users.length}</span> users
                </span>
              ) : (
                <span>No users found</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                ${currentPage >= totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;