const { Web3 } = require("web3");
const config = require('../config/config');
const contractABI = require('../contracts/abis/TouristId.json').abi;

let web3, contract, fromAddress;

const init = () => {
  web3 = new Web3(config.sepoliaRpcUrl);
  contract = new web3.eth.Contract(contractABI, config.contractAddress);
  const account = web3.eth.accounts.privateKeyToAccount(config.backendWalletKey);
  web3.eth.accounts.wallet.add(account);
  fromAddress = account.address;
  console.log("Blockchain service initialized. Admin address:", fromAddress);
};

const issueId = async ({ touristWallet, kycHash, itineraryHash, emergencyContact, durationDays }) => {
  const gas = await contract.methods.issueTouristId(touristWallet, kycHash, itineraryHash, emergencyContact, durationDays).estimateGas({ from: fromAddress });
  const tx = await contract.methods.issueTouristId(touristWallet, kycHash, itineraryHash, emergencyContact, durationDays).send({ from: fromAddress, gas });
  return tx;
};

const getTouristInfo = async (touristId) => {
    return await contract.methods.getTouristInfo(touristId).call();
};

module.exports = { init, issueId, getTouristInfo };