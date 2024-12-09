import React, { useState, useEffect } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { orderService } from '../services/orderService';
import OrderList from '../components/orders/OrderList';
import OrderDetails from '../components/orders/OrderDetails';
import OrderStatusModal from '../components/orders/OrderStatusModal';
import ReturnRefundManagement from '../components/orders/ReturnRefundManagement';
import toast from 'react-hot-toast';
import { Package, FileDown, ArrowLeft } from 'lucide-react';

const OrderManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders();
      if (response.orders) {
        setOrders(response.orders);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (orderId, statusData) => {
    try {
      await orderService.updateOrderStatus(orderId, statusData);
      toast.success('Order status updated successfully');
      fetchOrders();
      setIsStatusModalOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handleReturnRequest = async (requestId, actionData) => {
    try {
      const result = await orderService.processReturnRequest(requestId, actionData);
      if (result.success) {
        toast.success('Return request processed successfully');
        fetchReturnRequests();
      } else {
        toast.error(result.message || 'Failed to process return request');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to process return request');
      console.error('Return request error:', error);
    }
  };

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
      toast.success('Export started');
    } catch (error) {
      toast.error('Failed to export orders');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Order Management</h1>
              <p className="text-sm text-gray-600 mt-0.5">Manage and process customer orders</p>
            </div>
          </div>
          
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 text-sm font-medium 
              text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
              transition-colors w-full sm:w-auto"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export Analytics
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              className="px-4 md:px-6"
            >
              <Tab 
                label="Orders" 
                className="text-sm font-medium"
              />
              <Tab 
                label="Returns & Refunds" 
                className="text-sm font-medium"
              />
            </Tabs>
          </Box>

          <div className="p-4 md:p-6">
            {activeTab === 0 && (
              <div className="space-y-4">
                {selectedOrder ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium 
                        text-gray-700 bg-white border border-gray-300 rounded-lg 
                        shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 
                        focus:ring-blue-500/20 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Orders
                    </button>
                    <OrderDetails
                      order={selectedOrder}
                      onBack={() => setSelectedOrder(null)}
                      onStatusUpdate={() => setIsStatusModalOpen(true)}
                    />
                  </div>
                ) : (
                  <OrderList
                    orders={orders}
                    onOrderClick={setSelectedOrder}
                    loading={loading}
                  />
                )}
              </div>
            )}

            {activeTab === 1 && (
              <ReturnRefundManagement
                requests={returnRequests}
                onUpdateRequest={handleReturnRequest}
              />
            )}
          </div>
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
