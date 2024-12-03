import React from 'react';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import UserActions from '../components/users/UserActions';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import SellerVerification from '../components/users/SellerVerification';

const UserManagement = () => {
  const [activeTab, setActiveTab] = React.useState('all');
  const [pendingVerifications, setPendingVerifications] = React.useState({
    sellers: 0,
    buyers: 0
  });
  const [users, setUsers] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchPendingVerifications = async () => {
    try {
      const [pendingSellers, pendingBuyers] = await Promise.all([
        userService.getPendingSellers(),
        userService.getPendingBuyers()
      ]);
      setPendingVerifications({
        sellers: pendingSellers.length,
        buyers: pendingBuyers.length
      });
    } catch (error) {
      toast.error('Failed to fetch pending verifications');
    }
  };

  const fetchUsersByType = async () => {
    setIsLoading(true);
    try {
      let fetchedUsers;
      switch (activeTab) {
        case 'sellers':
          fetchedUsers = await userService.getSellers();
          break;
        case 'buyers':
          fetchedUsers = await userService.getBuyers();
          break;
        default:
          fetchedUsers = await userService.getAllUsers();
      }
      setUsers(fetchedUsers);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsersByType();
    fetchPendingVerifications();
  }, [activeTab]);

  const handleUpdateUser = async (userData) => {
    if (!selectedUser) return;

    try {
      await userService.updateUser(selectedUser.id, userData);
      await fetchUsersByType();
      setSelectedUser(null);
      setIsModalOpen(false);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleVerification = async (userId, approved) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      if (user.role === 'seller') {
        await userService.verifySeller(userId, approved);
      } else {
        await userService.verifyBuyer(userId, approved);
      }
      
      await fetchUsersByType();
      await fetchPendingVerifications();
      toast.success(`User ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      toast.error('Failed to verify user');
    }
  };

  const handleDelete = React.useCallback(async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        await fetchUsersByType();
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  }, []);

  const handleResetPassword = React.useCallback(async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      await userService.initiatePasswordReset(user.email);
      toast.success('Password reset email sent');
    } catch (error) {
      toast.error('Failed to send password reset email');
    }
  }, [users]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['all', 'sellers', 'buyers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' && pendingVerifications[tab] > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  {pendingVerifications[tab]}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <UserList 
          users={users} 
          onUserClick={(user) => {
            setSelectedUser(user);
            setIsModalOpen(true);
          }}
          actions={(user) => (
            <UserActions
              user={user}
              onStatusChange={(userId, newStatus) => handleVerification(userId, newStatus === 'approved')}
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
        {selectedUser?.verificationStatus === 'pending' ? (
          <SellerVerification
            seller={selectedUser}
            onApprove={(id) => handleVerification(id, true)}
            onReject={(id) => handleVerification(id, false)}
          />
        ) : (
          <UserForm
            user={selectedUser || undefined}
            onSubmit={handleUpdateUser}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedUser(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;