// src/api/routes/touristRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const touristController = require('../controllers/touristController');

// @route   POST api/tourist/panic
// @desc    Trigger a panic alert
// @access  Private
router.post('/panic', authMiddleware, touristController.triggerPanic);

module.exports = router;