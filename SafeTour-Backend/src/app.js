// 1. Load Environment Variables
// This should be the very first line to ensure all other files have access to the .env variables.
require('dotenv').config();

// 2. Import Dependencies
const express = require('express');
const cors = require('cors');

// 3. Import API Routes
const authRoutes = require('./api/routes/auth');
const adminRoutes = require('./api/routes/admin');
const { issueDigitalId } = require('./services/blockChainService'); // This is just to initialize it

// 4. Initialize Express App
const app = express();

// 5. Use Middleware
// Enables Cross-Origin Resource Sharing, allowing your mobile app to talk to this server.
app.use(cors());
// Parses incoming requests with JSON payloads.
app.use(express.json());

// 6. Define API Routes
// All routes starting with '/api/auth' will be handled by authRoutes.
app.use('/api/auth', authRoutes);
// All routes starting with '/api/admin' will be handled by adminRoutes.
app.use('/api/admin', adminRoutes);

// 7. Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    // A simple check to ensure the blockchain wallet is configured.
    if (process.env.BACKEND_WALLET_PRIVATE_KEY) {
        console.log("🔑 Backend wallet is configured.");
    } else {
        console.error("🚨 CRITICAL: BACKEND_WALLET_PRIVATE_KEY is not set in .env!");
    }
});