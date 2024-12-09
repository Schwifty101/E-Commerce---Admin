import React from 'react';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { productService } from '../services/productService';
import { Package, Filter, AlertTriangle } from 'lucide-react'; // Import icons

const ProductManagement = () => {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [showRejectionModal, setShowRejectionModal] = React.useState(false);
  const [rejectionProduct, setRejectionProduct] = React.useState(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [showProductModal, setShowProductModal] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    pageSize: 10,
    totalProducts: 0
  });

  // Fetch products on mount and when filter changes
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const filters = filterStatus === 'all' ? {} : { status: filterStatus };
        const data = await productService.getProducts(filters);
        setProducts(data);
        setPagination(prev => ({
          ...prev,
          totalProducts: data.length
        }));
      } catch (error) {
        toast.error(error.message);
        setProducts([]);
        setPagination(prev => ({
          ...prev,
          totalProducts: 0
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filterStatus]);

  const handleApprove = async (product) => {
    try {
      await productService.approveProduct(product._id);
      const updatedProducts = products.map((p) =>
        p._id === product._id ? { ...p, status: 'approved' } : p
      );
      setProducts(updatedProducts);
      toast.success('Product approved successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = (product) => {
    setRejectionProduct(product);
    setShowRejectionModal(true);
  };

  const handleRejectConfirm = async (reason) => {
    try {
      if (!reason || reason.length < 10) {
        toast.error('Please provide a detailed reason (minimum 10 characters)');
        return;
      }

      await productService.rejectProduct(rejectionProduct._id, reason);
      const updatedProducts = products.map((p) =>
        p._id === rejectionProduct._id
          ? { ...p, status: 'rejected', rejectionReason: reason }
          : p
      );
      setProducts(updatedProducts);
      setShowRejectionModal(false);
      setRejectionProduct(null);
      setRejectionReason('');
      toast.success('Product rejected successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEscalate = async (product) => {
    try {
      await productService.takeAction(product._id, 'escalate');
      const updatedProducts = products.map((p) =>
        p._id === product._id ? { ...p, status: 'escalated' } : p
      );
      setProducts(updatedProducts);
      toast.success('Product escalated to senior review');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (product) => {
    try {
      await productService.takeAction(product._id, 'delete');
      const updatedProducts = products.map((p) =>
        p._id === product._id ? { ...p, status: 'deleted' } : p
      );
      setProducts(updatedProducts);
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleProductUpdate = async (updatedData) => {
    try {
      // Only send allowed fields for update
      const allowedUpdates = {
        category: updatedData.category,
        status: updatedData.status,
        reports: updatedData.reports
      };

      const updated = await productService.updateProduct(selectedProduct._id, allowedUpdates);

      // Update local state
      setProducts(products.map(p =>
        p._id === updated._id ? updated : p
      ));

      setShowProductModal(false);
      setSelectedProduct(null);
      toast.success('Product updated successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-sm text-gray-600 mt-0.5">Manage and monitor product listings</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Filters Section */}
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-auto pl-9 pr-3 py-2 text-sm border border-gray-300 
                    rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                    bg-white transition-colors"
                >
                  <option value="all">All Products</option>
                  <option value="pending">Pending Approval</option>
                  <option value="flagged">Flagged Products</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product List */}
          <ProductList
            products={products}
            loading={loading}
            onProductClick={handleProductClick}
            onApprove={handleApprove}
            onReject={handleReject}
            onEscalate={handleEscalate}
            onDelete={handleDelete}
            pageSize={pagination.pageSize}
            currentPage={pagination.currentPage}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Rejection Modal */}
        <Modal
          isOpen={showRejectionModal}
          onClose={() => {
            setShowRejectionModal(false);
            setRejectionProduct(null);
            setRejectionReason('');
          }}
          title="Reject Product"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Rejection Confirmation</h4>
                <p className="text-sm text-red-700 mt-1">
                  Please provide a detailed reason for rejecting this product. This will be visible to the seller.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                Rejection Reason
              </label>
              <textarea
                id="rejectionReason"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                  text-gray-900 text-sm transition-colors"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Minimum 10 characters required"
                minLength={10}
                maxLength={500}
              />
              <p className="text-sm text-gray-500 flex justify-between">
                <span>
                  {rejectionReason.length}/500 characters
                  {rejectionReason.length < 10 && (
                    <span className="text-red-500 ml-1">(Minimum 10 required)</span>
                  )}
                </span>
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionProduct(null);
                  setRejectionReason('');
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 
                  bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectConfirm(rejectionReason)}
                disabled={rejectionReason.length < 10}
                className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-lg 
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                  ${rejectionReason.length < 10
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>

        {/* Product Details Modal */}
        <Modal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          title="Product Details"
          size="lg"
        >
          <ProductForm
            product={selectedProduct}
            onSubmit={handleProductUpdate}
            onCancel={() => {
              setShowProductModal(false);
              setSelectedProduct(null);
            }}
            isAdmin={true}
          />
        </Modal>
      </div>
    </div>
  );
};

export default ProductManagement;