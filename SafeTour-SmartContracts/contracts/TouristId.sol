// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TouristId is AccessControl, Pausable {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Tourist {
        bytes32 kycHash;          // Hash of Aadhaar/Passport
        bytes32 itineraryHash;    // Hash of the trip itinerary
        string emergencyContact;
        uint256 visitStartDate;
        uint256 visitEndDate;
        address walletAddress;    // Tourist's wallet address
        bool isValid;
    }

    mapping(uint256 => Tourist) public tourists;
    uint256 private _nextTouristId;

    event TouristIdIssued(uint256 indexed touristId, address indexed walletAddress, uint256 visitEndDate);
    event TouristIdRevoked(uint256 indexed touristId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _nextTouristId = 1;
    }

    function issueTouristId(
        address touristWallet,
        bytes32 kycHash,
        bytes32 itineraryHash,
        string calldata emergencyContact,
        uint256 visitDurationDays
    ) external onlyRole(ADMIN_ROLE) whenNotPaused {
        require(touristWallet != address(0), "Invalid wallet address");
        require(visitDurationDays > 0, "Visit duration must be positive");

        uint256 startDate = block.timestamp;
        uint256 endDate = startDate + (visitDurationDays * 1 days);

        tourists[_nextTouristId] = Tourist({
            kycHash: kycHash,
            itineraryHash: itineraryHash,
            emergencyContact: emergencyContact,
            visitStartDate: startDate,
            visitEndDate: endDate,
            walletAddress: touristWallet,
            isValid: true
        });

        emit TouristIdIssued(_nextTouristId, touristWallet, endDate);
        _nextTouristId++;
    }

    function getTouristInfo(uint256 touristId) external view returns (Tourist memory) {
        require(tourists[touristId].isValid, "Tourist ID is not valid or does not exist");
        return tourists[touristId];
    }

    function revokeId(uint256 touristId) external onlyRole(ADMIN_ROLE) {
        require(tourists[touristId].isValid, "Tourist ID is already invalid or does not exist");
        tourists[touristId].isValid = false;
        emit TouristIdRevoked(touristId);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}