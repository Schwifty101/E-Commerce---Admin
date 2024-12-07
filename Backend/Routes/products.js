const express = require('express');
const { isAuthenticated, isAdmin } = require('../Middleware/auth');
const productController = require('../Controllers/productController');
const { protect } = require('../Middleware/protect');

const router = express.Router();

// Protected routes - require admin authentication
router.get('/', isAuthenticated, isAdmin, productController.getProducts);
router.get('/flagged', isAuthenticated, isAdmin, productController.getFlaggedProducts);
router.post('/:id/approve', isAuthenticated, isAdmin, productController.approveProduct);
router.post('/:id/reject', isAuthenticated, isAdmin, productController.rejectProduct);
router.post('/:id/action', isAuthenticated, isAdmin, productController.takeAction);
router.patch('/:id', isAuthenticated, isAdmin, productController.updateProduct);
router.get('/getProduct/:id',protect ,productController.getProductById);
router.delete('/deleteProduct/:id', protect, productController.deleteProduct);
router.get('/search', protect,productController.searchProducts);
router.post('/', protect, productController.createProduct);
module.exports = router; 