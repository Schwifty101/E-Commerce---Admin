const express = require('express');
const { isAuthenticated, isAdmin } = require('../Middleware/auth');
const productController = require('../Controllers/productController');

const router = express.Router();

// Protected routes - require admin authentication
router.get('/', isAuthenticated, isAdmin, productController.getProducts);
router.get('/flagged', isAuthenticated, isAdmin, productController.getFlaggedProducts);
router.post('/:id/approve', isAuthenticated, isAdmin, productController.approveProduct);
router.post('/:id/reject', isAuthenticated, isAdmin, productController.rejectProduct);
router.post('/:id/action', isAuthenticated, isAdmin, productController.takeAction);
router.patch('/:id', isAuthenticated, isAdmin, productController.updateProduct);
router.get('/getProduct/:id',isAuthenticated ,productController.getProductById);
router.delete('/deleteProduct/:id', isAuthenticated, productController.deleteProduct);
router.get('/search', isAuthenticated,productController.searchProducts);
router.post('/', isAuthenticated, productController.createProduct);
module.exports = router; 