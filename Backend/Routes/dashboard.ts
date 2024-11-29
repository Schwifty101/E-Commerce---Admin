import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController';

const router = express.Router();

router.get('/stats', getDashboardStats);

export default router; 