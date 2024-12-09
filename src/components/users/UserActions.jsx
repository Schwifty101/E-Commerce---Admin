import React from 'react';
import toast from 'react-hot-toast';
import { Check, Ban, KeyRound, Trash2 } from 'lucide-react';

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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      onDelete(user.id);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {user.verificationStatus === 'pending' && (
        <button
          onClick={handleApprove}
          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium
            rounded-lg bg-green-50 text-green-700 hover:bg-green-100
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500/20
            transition-colors duration-200"
        >
          <Check className="w-3.5 h-3.5 mr-1.5" />
          <span className="hidden sm:inline">Approve</span>
        </button>
      )}

      {user.verificationStatus !== 'banned' && (
        <button
          onClick={handleBan}
          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium
            rounded-lg bg-red-50 text-red-700 hover:bg-red-100
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/20
            transition-colors duration-200"
        >
          <Ban className="w-3.5 h-3.5 mr-1.5" />
          <span className="hidden sm:inline">Ban</span>
        </button>
      )}

      <button
        onClick={handleResetPassword}
        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium
          rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/20
          transition-colors duration-200"
      >
        <KeyRound className="w-3.5 h-3.5 mr-1.5" />
        <span className="hidden sm:inline">Reset</span>
      </button>

      <button
        onClick={handleDelete}
        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium
          rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500/20
          transition-colors duration-200"
      >
        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
        <span className="hidden sm:inline">Delete</span>
      </button>

      <div className="sm:hidden absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
        px-2 py-1 text-xs text-white bg-gray-900 rounded-md opacity-0 
        group-hover:opacity-100 transition-opacity duration-200">
        {user.verificationStatus === 'pending' ? 'Approve' : 'Ban'} user
      </div>
    </div>
  );
};

export default UserActions; 