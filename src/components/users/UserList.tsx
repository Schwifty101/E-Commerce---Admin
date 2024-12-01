import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { User } from '../../types';
import Table from '../common/Table';
import { formatDate } from '../../utils/dateUtils';

interface UserListProps {
  users: User[];
  onUserClick: (user: User) => void;
  actions: (user: User) => React.ReactNode;
}

const UserList: React.FC<UserListProps> = ({ users, onUserClick, actions }) => {
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
        Cell: ({ value }: { value: string }) => (
          <span className="capitalize">{value}</span>
        ),
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }: { value: string }) => (
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
        Cell: ({ value }: { value: string }) => formatDate(value),
      },
      {
        Header: 'Last Login',
        accessor: 'lastLogin',
        Cell: ({ value }: { value: string }) => {
          if (!value) return '-';
          const date = parseISO(value);
          return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm') : 'Invalid date';
        }
      },
      {
        Header: 'Actions',
        Cell: ({ row }: { row: { original: User } }) => actions(row.original)
      }
    ],
    [actions]
  );

  return <Table columns={columns} data={users} onRowClick={onUserClick} />;
};

export default UserList;