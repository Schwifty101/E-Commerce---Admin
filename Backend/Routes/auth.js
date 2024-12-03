const express = require('express');
const { validateLogin, isAuthenticated, isAdmin } = require('../Middleware/auth');
const authController = require('../Controllers/authController');

const router = express.Router();

router.post('/login', validateLogin, authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.get('/check-auth', isAuthenticated, authController.checkAuth);

module.exports = router;