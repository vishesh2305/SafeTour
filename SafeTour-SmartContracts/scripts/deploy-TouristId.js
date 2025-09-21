const hre = require("hardhat");

async function main() {
  const touristId = await hre.ethers.deployContract("TouristId");
  await touristId.waitForDeployment();
  console.log(`TouristId contract deployed to: ${touristId.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});