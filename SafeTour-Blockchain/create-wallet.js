    const { ethers } = require("ethers");

    // Create a new random wallet
    const wallet = ethers.Wallet.createRandom();

    console.log("--- New Backend Wallet Generated ---");
    console.log(`\nSave this information securely. Do NOT commit it to Git.`);
    console.log(`\nPublic Address: ${wallet.address}`);
    console.log(`Private Key: ${wallet.privateKey}`);
    console.log("\n--- Action Required ---");
    console.log("1. Copy the Public Address and add it to SafeTour-Blockchain/.env as BACKEND_WALLET_ADDRESS.");
    console.log("2. Copy the Private Key and add it to SafeTour-Backend/.env as BACKEND_WALLET_PRIVATE_KEY.");
    
