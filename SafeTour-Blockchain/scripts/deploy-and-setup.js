const hre = require("hardhat");

async function main() {
  const backendWalletAddress = process.env.BACKEND_WALLET_ADDRESS;
  if (!backendWalletAddress) {
    throw new Error("BACKEND_WALLET_ADDRESS is not set in .env file");
  }

  console.log("Deploying TouristId contract...");
  const touristIdContract = await hre.ethers.deployContract("TouristId");
  await touristIdContract.waitForDeployment();
  const contractAddress = touristIdContract.target;
  console.log(`✅ TouristId contract deployed to: ${contractAddress}`);

  console.log("\nWaiting for 5 block confirmations before verification...");
  await touristIdContract.deploymentTransaction().wait(5);

  console.log("Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully on Etherscan.");
  } catch (error) {
    console.error("Verification failed:", error.message);
  }

  console.log(`\nGranting ID_ISSUER_ROLE to the backend wallet: ${backendWalletAddress}`);
  const idIssuerRole = await touristIdContract.ID_ISSUER_ROLE();
  const grantRoleTx = await touristIdContract.grantRole(idIssuerRole, backendWalletAddress);
  await grantRoleTx.wait();
  console.log("✅ Role granted successfully. Transaction hash:", grantRoleTx.hash);

  console.log("\n--- Setup Complete ---");
  console.log(`Contract Address: ${contractAddress}`);
  console.log("You can now update your backend .env file with this address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
