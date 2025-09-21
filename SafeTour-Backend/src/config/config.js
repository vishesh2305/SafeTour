require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  sepoliaRpcUrl: process.env.SEPOLIA_RPC_URL,
  backendWalletKey: process.env.BACKEND_WALLET_KEY,
  contractAddress: process.env.CONTRACT_ADDRESS,
};

// Add verification logic here for production

module.exports = config;