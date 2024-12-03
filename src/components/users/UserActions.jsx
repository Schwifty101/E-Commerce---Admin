import React from 'react';
import toast from 'react-hot-toast';

const UserActions = ({ user, onStatusChange, onDelete, onResetPassword }) => {
  const handleApprove = () => {
    onStatusChange(user.id, 'active');
    toast.success(`${user.role === 'seller' ? 'Seller' : 'Buyer'} approved successfully`);
  };

  const handleBan = () => {
    onStatusChange(user.id, 'banned');
    toast.success(`User banned successfully`);
  };

  const handleResetPassword = () => {
    onResetPassword(user.id);
    toast.success('Password reset email sent');
  };

  return (
    <div className="space-x-2">
      {user.verificationStatus === 'pending' && (
        <button
          onClick={handleApprove}
          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          Approve
        </button>
      )}

      {user.verificationStatus !== 'rejected' && (
        <button
          onClick={handleBan}
          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
        >
          Ban
        </button>
      )}

      <button
        onClick={handleResetPassword}
        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
      >
        Reset Password
      </button>

      <button
        onClick={() => onDelete(user.id)}
        className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
      >
        Delete
      </button>
    </div>
  );
};

export default UserActions; 