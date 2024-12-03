import React from 'react';
import toast from 'react-hot-toast';

const ProductForm = ({ product, onSubmit, onCancel, isAdmin = false }) => {
  const [formData, setFormData] = React.useState({
    name: product?.name || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    category: product?.category || '',
    image: product?.image || '',
    status: product?.status || 'pending',
    seller: product?.seller || '',
    description: product?.description || '',
    rejectionReason: product?.rejectionReason || '',
    flaggedReasons: product?.flaggedReasons || [],
    reports: product?.reports || [],
  });

  const [newReport, setNewReport] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      // Only include fields that have changed and are not empty
      const updateData = {};
      
      if (formData.category && formData.category !== product.category) {
        updateData.category = formData.category;
      }
      
      if (formData.status && formData.status !== product.status) {
        updateData.status = formData.status;
      }
      
      if (formData.reports && formData.reports.length > 0) {
        // Format reports properly
        updateData.reports = formData.reports.map(report => ({
          reason: report.reason,
          createdAt: report.createdAt || new Date(),
          reportedBy: report.reportedBy || 'admin'
        }));
      }

      // Only submit if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        return;
      }

      await onSubmit(updateData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const addReport = () => {
    if (newReport.trim()) {
      setFormData({
        ...formData,
        reports: [...formData.reports, {
          reason: newReport.trim(),
          createdAt: new Date(),
          reportedBy: 'admin'
        }]
      });
      setNewReport('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Read-only fields for admin */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          type="text"
          value={formData.name}
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
          disabled
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={formData.price}
              className="pl-7 block w-full rounded-md border-gray-300 bg-gray-50"
              disabled
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stock
          </label>
          <input
            type="number"
            value={formData.stock}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
            disabled
          />
        </div>
      </div>

      {/* Editable fields for admin */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <input
          type="text"
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="flagged">Flagged</option>
          <option value="deleted">Deleted</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {/* Reports section */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Reports ({formData.reports.length})
        </label>
        <div className="mt-2 space-y-2">
          {formData.reports.map((report, index) => (
            <div key={index} className="p-2 bg-red-50 rounded-md">
              <p className="text-sm text-red-700">{report.reason}</p>
              <p className="text-xs text-gray-500">
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex space-x-2">
          <input
            type="text"
            value={newReport}
            onChange={(e) => setNewReport(e.target.value)}
            placeholder="Add a report..."
            className="flex-1 rounded-md border-gray-300"
          />
          <button
            type="button"
            onClick={addReport}
            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Add Report
          </button>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;