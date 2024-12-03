import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import Table from '../common/Table';
import { formatDate } from '../../utils/dateUtils';

const UserList = ({ users, onUserClick, actions }) => {
  const filteredUsers = users.filter(user => user.role !== 'admin');

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
        Header: 'Status',
        accessor: 'status',
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
        Header: 'Created At',
        accessor: 'createdAt',
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: 'Last Login',
        accessor: 'lastLogin',
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
              ${value === 'approved' ? 'bg-green-100 text-green-800' :
              value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'}`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: 'Business Details',
        accessor: 'businessDetails',
        Cell: ({ row }) => 
          row.original.role === 'seller' ? (
            <span className="text-sm text-gray-600">
              {row.original.businessDetails?.companyName || '-'}
            </span>
          ) : null
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => actions(row.original)
      }
    ],
    [actions]
  );

  return <Table columns={columns} data={filteredUsers} onRowClick={onUserClick} />;
};

export default UserList;