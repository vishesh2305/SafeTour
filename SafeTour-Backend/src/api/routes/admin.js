const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { issueDigitalId } = require('../../services/blockChainService');
const { ethers } = require("ethers");

// POST /api/admin/issue-id
// This is a protected route. The `verifyToken` middleware runs first.
router.post('/issue-id', verifyToken, async (req, res) => {
    const { touristAddress, kycData } = req.body;

    if (!touristAddress || !kycData) {
        return res.status(400).json({ message: "touristAddress and kycData are required." });
    }

    try {
        // Generate a SHA-256 style hash of the KYC data using ethers v6
        const kycHash = ethers.hashMessage(JSON.stringify(kycData));

        console.log(`Received request to issue ID for ${touristAddress} with KYC hash: ${kycHash}`);
        
        // Call your blockchain service to issue the digital ID
        const txHash = await issueDigitalId(touristAddress, kycHash);

        res.status(200).json({ 
            message: 'Digital ID issued successfully.',
            transactionHash: txHash 
        });

    } catch (error) {
        console.error("Error in /issue-id route:", error);
        res.status(500).json({ message: "Server error while issuing ID." });
    }
});

module.exports = router;