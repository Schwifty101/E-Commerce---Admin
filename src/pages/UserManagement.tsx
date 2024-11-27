import React from 'react';
import { User } from '../types';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import Modal from '../components/common/Modal';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'buyer',
    status: 'active',
    createdAt: '2024-03-01T00:00:00Z',
    lastLogin: '2024-03-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'seller',
    status: 'pending',
    createdAt: '2024-03-10T00:00:00Z',
    lastLogin: '2024-03-14T15:45:00Z',
  },
];

const UserManagement = () => {
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleCreateUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    } as User;

    setUsers([...users, newUser]);
    setIsModalOpen(false);
    toast.success('User created successfully');
  };

  const handleUpdateUser = (userData: Partial<User>) => {
    if (!selectedUser) return;

    const updatedUsers = users.map((user) =>
      user.id === selectedUser.id ? { ...user, ...userData } : user
    );

    setUsers(updatedUsers);
    setSelectedUser(null);
    setIsModalOpen(false);
    toast.success('User updated successfully');
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <UserList users={users} onUserClick={handleUserClick} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? 'Edit User' : 'Create User'}
      >
        <UserForm
          user={selectedUser || undefined}
          onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default UserManagement;