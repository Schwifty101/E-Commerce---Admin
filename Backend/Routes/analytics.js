const express = require('express');
const { isAuthenticated, isAdmin } = require('../Middleware/auth');
const analyticsController = require('../Controllers/analyticsController');
const { validateDateRange } = require('../Middleware/validation');

const router = express.Router();

// Overview Stats
router.get('/overview', 
    isAuthenticated, 
    isAdmin, 
    analyticsController.getOverviewStats
);

// Revenue Analysis
router.get('/revenue',
    isAuthenticated,
    isAdmin,
    validateDateRange,
    analyticsController.getRevenueAnalytics
);

// User Activity
router.get('/user-activity',
    isAuthenticated,
    isAdmin,
    validateDateRange,
    analyticsController.getUserActivity
);

// Top Products
router.get('/top-products',
    isAuthenticated,
    isAdmin,
    validateDateRange,
    analyticsController.getTopProducts
);

// Export Data
router.post('/export',
    isAuthenticated,
    isAdmin,
    validateDateRange,
    analyticsController.exportData
);

module.exports = router; 