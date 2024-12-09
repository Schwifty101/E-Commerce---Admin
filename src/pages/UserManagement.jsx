import React from 'react';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import UserActions from '../components/users/UserActions';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import SellerVerification from '../components/users/SellerVerification';
import { Users } from 'lucide-react';

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
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    pageSize: 10,
    totalUsers: 0
  });

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
      let response;
      
      switch (activeTab) {
        case 'sellers':
          response = await userService.getSellers();
          break;
        case 'buyers':
          response = await userService.getBuyers();
          break;
        default:
          response = await userService.getAllUsers();
      }
      
      // Store all users in state
      const allUsers = Array.isArray(response) ? response : response.users || [];
      setUsers(allUsers);
      setPagination(prev => ({
        ...prev,
        totalUsers: allUsers.length
      }));
    } catch (error) {
      toast.error(`Failed to fetch users: ${error.message}`);
      setUsers([]);
      setPagination(prev => ({
        ...prev,
        totalUsers: 0
      }));
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;
      await fetchUsersByType();
      await fetchPendingVerifications();
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [activeTab, pagination.currentPage, pagination.pageSize]);

  const handleUpdateUser = async (userData) => {
    if (!selectedUser) return;

    try {
      const updatedUser = await userService.updateUser(selectedUser.id, userData);
      setUsers(users.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      setSelectedUser(null);
      setIsModalOpen(false);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error(`Failed to update user: ${error.message}`);
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
      toast.success(`User ${approved ? 'approved' : 'banned'} successfully`);
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

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-600 mt-0.5">Manage and monitor user accounts</p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 -mx-4 px-4 md:mx-0 md:px-0">
          <nav className="flex space-x-2 md:space-x-4 overflow-x-auto hide-scrollbar">
            {['all', 'sellers', 'buyers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap py-3 px-3 border-b-2 text-sm font-medium
                  transition-colors duration-200 ease-in-out min-w-[80px]
                  flex items-center justify-center
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <span className="capitalize">{tab}</span>
                  {tab !== 'all' && pendingVerifications[tab] > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs 
                      rounded-full bg-yellow-100 text-yellow-800 font-medium min-w-[20px]">
                      {pendingVerifications[tab]}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-600">Loading users...</p>
              </div>
            </div>
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
              pageSize={pagination.pageSize}
              currentPage={pagination.currentPage}
              totalUsers={pagination.totalUsers}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          title={selectedUser ? 'Edit User' : 'Create User'}
          size="lg"
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
    </div>
  );
};

export default UserManagement;