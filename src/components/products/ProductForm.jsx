import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { DollarSign, Package, Tag, Boxes } from 'lucide-react';

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
  const [newReport, setNewReport] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRemoveReport = (reportId) => {
    setFormData({
      ...formData,
      reports: formData.reports.filter(report => report._id !== reportId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const updateData = {};

      if (formData.category !== product.category) {
        updateData.category = formData.category;
      }

      if (formData.status !== product.status) {
        if ((formData.status === 'rejected' || formData.status === 'deleted') &&
          formData.reports.length === 0) {
          toast.error('A report is required when rejecting or deleting a product');
          return;
        }
        updateData.status = formData.status;
      }

      if (formData.reports.length !== product.reports.length ||
        JSON.stringify(formData.reports) !== JSON.stringify(product.reports)) {
        updateData.reports = formData.reports;
      }

      if (Object.keys(updateData).length === 0) {
        toast.success('No changes to save');
        return;
      }

      await onSubmit(updateData);
    } catch (error) {
      toast.error(error.message || 'Failed to update product');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900">
          <Package className="w-5 h-5" />
          <h3 className="text-lg font-medium">Product Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Read-only fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 
                shadow-sm text-gray-500 sm:text-sm"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <div className="mt-1 relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                value={formData.price}
                className="pl-8 block w-full rounded-lg border-gray-300 bg-gray-50 
                  shadow-sm text-gray-500 sm:text-sm"
                disabled
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stock
            </label>
            <div className="mt-1 relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Boxes className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                value={formData.stock}
                className="pl-8 block w-full rounded-lg border-gray-300 bg-gray-50 
                  shadow-sm text-gray-500 sm:text-sm"
                disabled
              />
            </div>
          </div>

          {/* Editable fields */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <div className="mt-1 relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Tag className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="pl-8 block w-full rounded-lg border-gray-300 shadow-sm 
                  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                  transition-colors sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
              transition-colors sm:text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
            <option value="deleted">Deleted</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>

        {/* Reports Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Reports ({formData.reports.length})
          </label>
          <div className="space-y-2">
            {formData.reports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 
                bg-red-50 rounded-lg border border-red-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-red-700">{report.description || report.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveReport(report._id || index)}
                  className="ml-3 p-1.5 text-red-600 hover:text-red-800 
                    hover:bg-red-100 rounded-md transition-colors"
                  title="Remove report"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newReport}
              onChange={(e) => setNewReport(e.target.value)}
              placeholder="Add a report..."
              className="flex-1 rounded-lg border-gray-300 shadow-sm 
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                transition-colors sm:text-sm"
            />
            <button
              type="button"
              onClick={addReport}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 
                rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Add Report
            </button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 
            bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white 
            bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
            disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;