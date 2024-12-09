const express = require('express');
const { isAuthenticated, isAdmin } = require('../Middleware/auth');
const analyticsController = require('../Controllers/analyticsController');
const { validatePeriod } = require('../Middleware/validation');

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
    validatePeriod,
    analyticsController.getRevenueAnalytics
);

// User Activity
router.get('/user-activity',
    isAuthenticated,
    isAdmin,
    validatePeriod,
    analyticsController.getUserActivity
);

// Top Products
router.get('/top-products',
    isAuthenticated,
    isAdmin,
    validatePeriod,
    analyticsController.getTopProducts
);

// Export Data
router.get('/export',
    isAuthenticated,
    isAdmin,
    validatePeriod,
    analyticsController.exportData
);

module.exports = router; 