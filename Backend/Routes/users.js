const express = require('express');
const { isAuthenticated, isAdmin } = require('../Middleware/auth');
const userController = require('../Controllers/userController');
const { protect } = require('../Middleware/protect');

const router = express.Router();

// Admin routes
router.get('/', isAuthenticated, isAdmin, userController.getAllUsers);
router.put('/:id', isAuthenticated, isAdmin, userController.updateUser);
router.post('/:id/approve', isAuthenticated, isAdmin, userController.approveUser);
router.post('/:id/ban', isAuthenticated, isAdmin, userController.banUser);
router.delete('/:id', isAuthenticated, isAdmin, userController.deleteUser);
router.post('/', isAuthenticated, isAdmin, userController.createUser);

// Seller routes
router.get('/sellers', isAuthenticated, isAdmin, userController.getSellers);
router.get('/sellers/pending', isAuthenticated, isAdmin, userController.getPendingSellers);
router.post('/sellers/:id/verify', isAuthenticated, isAdmin, userController.verifySeller);

// Buyer routes
router.get('/buyers', isAuthenticated, isAdmin, userController.getBuyers);
router.get('/buyers/pending', isAuthenticated, isAdmin, userController.getPendingBuyers);
router.post('/buyers/:id/verify', isAuthenticated, isAdmin, userController.verifyBuyer);

router.get('/profile',protect , userController.getUserProfile);
router.put('/profile' ,protect ,userController.updateUserProfile);
router.get('/orders' ,protect ,userController.getUserOrders);
router.use('/products', require('./products.js'));

router.post('/signup', userController.signup);
router.post('/login', userController.login);
// Export route
router.post('/export', isAuthenticated, isAdmin, userController.exportUserList);

module.exports = router; 