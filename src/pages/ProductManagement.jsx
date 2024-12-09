import React from 'react';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { productService } from '../services/productService';

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
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2"
            >
              <option value="all">All Products</option>
              <option value="pending">Pending Approval</option>
              <option value="flagged">Flagged Products</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

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
      </div>

      <Modal
        isOpen={showRejectionModal}
        onClose={() => {
          setShowRejectionModal(false);
          setRejectionProduct(null);
          setRejectionReason('');
        }}
        title="Reject Product"
      >
        <div className="p-6 space-y-6">
          <p>Please provide a detailed reason for rejecting this product:</p>
          <textarea
            className="w-full rounded-md border-gray-300"
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Minimum 10 characters required"
            minLength={10}
            maxLength={500}
          />
          <p className="text-sm text-gray-500">
            {rejectionReason.length}/500 characters
            {rejectionReason.length < 10 && (
              <span className="text-red-500"> (Minimum 10 characters required)</span>
            )}
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowRejectionModal(false);
                setRejectionProduct(null);
                setRejectionReason('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={() => handleRejectConfirm(rejectionReason)}
              disabled={rejectionReason.length < 10}
              className={`px-4 py-2 text-white rounded-md ${rejectionReason.length < 10
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
                }`}
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        title="Product Details"
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
  );
};

export default ProductManagement;