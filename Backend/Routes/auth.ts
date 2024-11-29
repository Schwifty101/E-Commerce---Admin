import express from 'express';
import { validateLogin, isAuthenticated, isAdmin } from '../middleware/auth';
import * as authController from '../controllers/authController';

const router = express.Router();

router.post('/login', validateLogin, authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.get('/check-auth', isAuthenticated, authController.checkAuth);

export default router;