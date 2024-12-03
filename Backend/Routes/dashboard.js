const express = require('express');
const dashboardController = require('../Controllers/dashboardController');

const router = express.Router();

router.get('/stats', dashboardController.getDashboardStats);

module.exports = router; 