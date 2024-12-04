import React, { useState, useEffect } from 'react';
import { Box, Tab, Tabs, Button, Typography } from '@mui/material';
import { orderService } from '../services/orderService';
import OrderList from '../components/orders/OrderList';
import OrderDetails from '../components/orders/OrderDetails';
import OrderStatusModal from '../components/orders/OrderStatusModal';
import ReturnRefundManagement from '../components/orders/ReturnRefundManagement';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Fetch orders with filters
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await orderService.getOrders({
        page,
        limit: pagination.limit,
        // Add any additional filters here if needed
      });

      if (response.orders && response.pagination) {
        setOrders(response.orders);
        setPagination(prev => ({
          ...prev,
          page: response.pagination.currentPage || page,
          total: response.pagination.total || 0,
          limit: response.pagination.limit || prev.limit
        }));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch return requests
  const fetchReturnRequests = async () => {
    try {
      const response = await orderService.getReturnRequests();
      setReturnRequests(response.returns);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch return requests');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchReturnRequests();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedOrder(null);
  };

  // Handle order status update
  const handleStatusUpdate = async (orderId, statusData) => {
    try {
      await orderService.updateOrderStatus(orderId, statusData);
      toast.success('Order status updated successfully');
      fetchOrders(pagination.page);
      setIsStatusModalOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  // Handle return request processing
  const handleReturnRequest = async (requestId, actionData) => {
    try {
      await orderService.processReturnRequest(requestId, actionData);
      toast.success('Return request processed successfully');
      fetchReturnRequests();
    } catch (error) {
      toast.error(error.message || 'Failed to process return request');
    }
  };

  // Handle order export
  const handleExport = async () => {
    try {
      const blob = await orderService.exportOrders();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export orders');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <Button 
          variant="contained" 
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
        >
          Export Orders
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Orders" />
            <Tab label="Returns & Refunds" />
          </Tabs>
        </Box>

        <div className="p-6">
          {activeTab === 0 && (
            <Box>
              {selectedOrder ? (
                <Box className="space-y-6">
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedOrder(null)}
                    className="mb-4"
                  >
                    Back to Orders
                  </Button>
                  <OrderDetails 
                    order={selectedOrder}
                    onBack={() => setSelectedOrder(null)}
                    onStatusUpdate={() => setIsStatusModalOpen(true)}
                  />
                </Box>
              ) : (
                <OrderList
                  orders={orders}
                  onOrderClick={setSelectedOrder}
                  currentPage={pagination.page}
                  totalPages={Math.ceil(pagination.total / pagination.limit)}
                  onPageChange={fetchOrders}
                  loading={loading}
                />
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <ReturnRefundManagement
              requests={returnRequests}
              onUpdateRequest={handleReturnRequest}
            />
          )}
        </div>

        <OrderStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          order={selectedOrder}
          onUpdateStatus={handleStatusUpdate}
        />
      </div>
    </div>
  );
};

export default OrderManagement;
