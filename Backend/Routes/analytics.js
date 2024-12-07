const express = require('express');
const { isAuthenticated, isAdmin } = require('../Middleware/auth');
const analyticsController = require('../Controllers/analyticsController');
const { validateDateRange } = require('../Middleware/validation');

const router = express.Router();

// Dashboard Stats
router.get('/stats/overview', isAuthenticated, isAdmin, analyticsController.getOverviewStats);

// Revenue Analysis
router.get('/revenue',
    isAuthenticated,
    isAdmin,
    validateDateRange,
    analyticsController.getRevenueAnalytics
);

// User Activity
router.get('/users/activity',
    isAuthenticated,
    isAdmin,
    validateDateRange,
    analyticsController.getUserActivity
);

// System Logs
router.get('/logs',
    isAuthenticated,
    isAdmin,
    validateDateRange,
    analyticsController.getSystemLogs
);

// Top Products
router.get('/products/top',
    isAuthenticated,
    isAdmin,
    validateDateRange,
    analyticsController.getTopProducts
);

// Export Data
router.post('/export/:type',
    isAuthenticated,
    isAdmin,
    validateDateRange,
    analyticsController.exportData
);

module.exports = router; 