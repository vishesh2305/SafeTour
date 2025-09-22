// src/api/routes/alertRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware'); // Import the new middleware
const alertController = require('../controllers/alertController');

// @route   GET api/alerts
// @desc    Get all active panic alerts (for admins/police)
// @access  Private (Admin)
router.get('/', [authMiddleware, adminMiddleware], alertController.getActiveAlerts);

module.exports = router;