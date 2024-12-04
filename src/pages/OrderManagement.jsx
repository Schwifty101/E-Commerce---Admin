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
    <Box sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Orders" />
          <Tab label="Returns & Refunds" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Order Management</Typography>
            <Button variant="contained" onClick={handleExport}>
              Export Orders
            </Button>
          </Box>

          {selectedOrder ? (
            <Box>
              <Button
                variant="outlined"
                onClick={() => setSelectedOrder(null)}
                sx={{ mb: 2 }}
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

      <OrderStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        order={selectedOrder}
        onUpdateStatus={handleStatusUpdate}
      />
    </Box>
  );
};

export default OrderManagement;
