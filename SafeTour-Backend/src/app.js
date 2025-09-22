const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const blockchainService = require('./services/blockchainService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
mongoose.connect(config.mongoUri)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error(err));

// Initialize Blockchain Service
try {
    blockchainService.init();
} catch (err) {
    console.error("Failed to initialize Blockchain Service:", err);
}

// Define Routes
app.use('/api/auth', require('./api/routes/authRoutes'));
// app.use('/api/admin', require('./api/routes/adminRoutes'));
app.use('/api/tourist', require('./api/routes/touristRoutes'));
app.use('/api/alerts', require('./api/routes/alertRoutes.js')); // <-- ADD THIS LINE

const PORT = config.port;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));