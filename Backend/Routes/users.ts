import express from 'express';
import { isAuthenticated, isAdmin } from '../Middleware/auth';
import * as userController from '../Controllers/userController';

const router = express.Router();

// Admin routes
router.get('/', isAuthenticated, isAdmin, userController.getAllUsers);
router.put('/:id', isAuthenticated, isAdmin, userController.updateUser);
router.post('/:id/approve', isAuthenticated, isAdmin, userController.approveUser);
router.post('/:id/ban', isAuthenticated, isAdmin, userController.banUser);
router.delete('/:id', isAuthenticated, isAdmin, userController.deleteUser);

// Seller routes
router.get('/sellers/pending', isAuthenticated, isAdmin, userController.getSellerVerifications);
router.post('/sellers/:id/approve', isAuthenticated, isAdmin, userController.approveSellerApplication);

// Buyer routes
router.get('/buyers/:id/stats', isAuthenticated, userController.getBuyerStats);

// Export route
router.post('/export', isAuthenticated, isAdmin, userController.exportUserList);

export default router; 