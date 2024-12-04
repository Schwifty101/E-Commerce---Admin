const express = require('express');
const { isAuthenticated, isAdmin } = require('../Middleware/auth');
const orderController = require('../Controllers/orderController');
const { validateOrderStatus, validateReturnAction } = require('../Middleware/validation');

const router = express.Router();

// Order management routes
router.get('/', isAuthenticated, isAdmin, orderController.getOrders);
router.get('/history', isAuthenticated, isAdmin, orderController.getOrderHistory);
router.get('/export', isAuthenticated, isAdmin, orderController.exportOrders);
router.patch('/:id/status', isAuthenticated, isAdmin, validateOrderStatus, orderController.updateOrderStatus);

// Returns and refunds routes
router.get('/returns', isAuthenticated, isAdmin, orderController.getReturnRequests);
router.post('/:id/returns', isAuthenticated, isAdmin, validateReturnAction, orderController.processReturnRequest);

// Order details route
router.get('/:id', isAuthenticated, isAdmin, orderController.getOrderDetails);

module.exports = router; 