import React from 'react';
import { User, Building2, Mail, UserCircle, Shield } from 'lucide-react'; // Import icons

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'buyer',
    verificationStatus: user?.verificationStatus || 'pending',
    businessDetails: user?.businessDetails || {
      companyName: '',
      registrationNumber: '',
      address: '',
      phone: '',
      verificationDocuments: [],
      verified: false
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderSellerFields = () => (
    formData.role === 'seller' && (
      <div className="space-y-4 pt-4 mt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-gray-900">
          <Building2 className="w-4 h-4" />
          <h3 className="font-medium">Business Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              value={formData.businessDetails.companyName}
              onChange={(e) => setFormData({
                ...formData,
                businessDetails: { ...formData.businessDetails, companyName: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                text-gray-900 text-sm transition-colors"
              placeholder="Enter company name"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
              Registration Number
            </label>
            <input
              type="text"
              id="registrationNumber"
              value={formData.businessDetails.registrationNumber}
              onChange={(e) => setFormData({
                ...formData,
                businessDetails: { ...formData.businessDetails, registrationNumber: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                text-gray-900 text-sm transition-colors"
              placeholder="Enter registration number"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Business Address
            </label>
            <textarea
              id="address"
              value={formData.businessDetails.address}
              onChange={(e) => setFormData({
                ...formData,
                businessDetails: { ...formData.businessDetails, address: e.target.value }
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                text-gray-900 text-sm transition-colors"
              placeholder="Enter business address"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Business Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.businessDetails.phone}
              onChange={(e) => setFormData({
                ...formData,
                businessDetails: { ...formData.businessDetails, phone: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                text-gray-900 text-sm transition-colors"
              placeholder="Enter business phone"
            />
          </div>
        </div>
      </div>
    )
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900">
          <User className="w-4 h-4" />
          <h3 className="font-medium">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                  text-gray-900 text-sm transition-colors"
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                  text-gray-900 text-sm transition-colors"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              User Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                  text-gray-900 text-sm transition-colors appearance-none"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="verificationStatus" className="block text-sm font-medium text-gray-700">
              Verification Status
            </label>
            <select
              id="verificationStatus"
              value={formData.verificationStatus}
              onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                text-gray-900 text-sm transition-colors"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seller Fields */}
      {renderSellerFields()}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border 
            border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
            border border-transparent rounded-lg shadow-sm hover:bg-blue-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
        >
          {user ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;