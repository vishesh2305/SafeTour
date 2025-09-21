const { ethers } = require("ethers");

// --- You would get these from your deployment script ---
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const CONTRACT_ABI = [ /* ... ABI from compilation ... */ ];
const BACKEND_PRIVATE_KEY = "YOUR_BACKEND_WALLET_PRIVATE_KEY";
const PROVIDER_URL = "YOUR_BLOCKCHAIN_NODE_URL"; // e.g., from Infura or Alchemy

async function issueDigitalId(touristWalletAddress, kycHash, itineraryHash, validityInDays) {
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const wallet = new ethers.Wallet(BACKEND_PRIVATE_KEY, provider);
    const touristIdContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    const validityInSeconds = validityInDays * 24 * 60 * 60;

    console.log(`Registering tourist ${touristWalletAddress}...`);
    const tx = await touristIdContract.registerTourist(
        touristWalletAddress,
        kycHash,
        itineraryHash,
        validityInSeconds
    );

    await tx.wait(); // Wait for the transaction to be mined
    console.log("Tourist registered successfully! Transaction hash:", tx.hash);
}
