import React from 'react';
import { User } from '../../types';
import Table from '../common/Table';
import { format } from 'date-fns';

interface UserListProps {
  users: User[];
  onUserClick: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onUserClick }) => {
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
        Cell: ({ value }: { value: string }) => format(new Date(value), 'MMM dd, yyyy'),
      },
      {
        Header: 'Last Login',
        accessor: 'lastLogin',
        Cell: ({ value }: { value: string }) => format(new Date(value), 'MMM dd, yyyy HH:mm'),
      },
    ],
    []
  );

  return <Table columns={columns} data={users} onRowClick={onUserClick} />;
};

export default UserList;