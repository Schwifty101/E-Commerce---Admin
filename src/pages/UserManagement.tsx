import React from 'react';
import { User } from '../types';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import UserActions from '../components/users/UserActions';
import Modal from '../components/common/Modal';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';

const UserManagement = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      await userService.updateUser(selectedUser.id, userData);
      await fetchUsers();
      setSelectedUser(null);
      setIsModalOpen(false);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      if (newStatus === 'active') {
        await userService.approveUser(userId);
      } else if (newStatus === 'banned') {
        await userService.banUser(userId);
      }
      await fetchUsers();
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        await fetchUsers();
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleResetPassword = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      await userService.initiatePasswordReset(user.email);
      toast.success('Password reset email sent');
    } catch (error) {
      toast.error('Failed to send password reset email');
    }
  };

  return (
    <div className="space-y-6 p-6">
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

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <UserList 
          users={users} 
          onUserClick={setSelectedUser}
          actions={(user) => (
            <UserActions
              user={user}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onResetPassword={handleResetPassword}
            />
          )}
        />
      )}

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
          onSubmit={handleUpdateUser}
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