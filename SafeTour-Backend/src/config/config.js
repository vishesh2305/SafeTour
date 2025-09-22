// src/config/config.js
require('dotenv').config();

const config = {
    port: (process.env.PORT || '3000').trim(),
    mongoUri: (process.env.MONGO_URI || '').trim(),
    // Ensure the JWT_SECRET is trimmed of any whitespace
    jwtSecret: (process.env.JWT_SECRET || '').trim(),
    sepoliaRpcUrl: (process.env.SEPOLIA_RPC_URL || '').trim(),
    backendWalletKey: (process.env.BACKEND_WALLET_KEY || '').trim(),
    contractAddress: (process.env.CONTRACT_ADDRESS || '').trim()
};

// Verification to catch errors early
if (!config.jwtSecret) {
    throw new Error("🚨 Missing required environment variable: JWT_SECRET");
}

module.exports = config;