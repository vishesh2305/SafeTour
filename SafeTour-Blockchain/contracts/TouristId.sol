// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";


/// @title TouristId
/// @author ...
/// @notice Manages on-chain tourist IDs with role-based issuance and pausing capabilities.
/// @dev Uses OpenZeppelin AccessControl + Pausable. Keep OpenZeppelin dependency updated in your project.
contract TouristId is AccessControl, Pausable {
    /// Roles
    bytes32 public constant ID_ISSUER_ROLE = keccak256("ID_ISSUER_ROLE");

    /// @notice Struct representing stored tourist identity metadata.
    /// @dev Choose field types with packing in mind (address + 2x bytes32 + 2x uint256 + bool).
    struct Tourist {
        address walletAddress;
        bytes32 kycDataHash;
        bytes32 itineraryHash;
        uint256 registrationDate;
        uint256 expiryDate;
        bool isActive;
    }

    /// Storage
    mapping(address => Tourist) private _touristData;

    /// Events
    event TouristRegistered(address indexed issuer, address indexed tourist, uint256 expiryDate, bytes32 indexed kycHash);
    event TouristUpdated(address indexed updater, address indexed tourist, bytes32 newKycHash, bytes32 newItineraryHash, uint256 newExpiryDate);
    event TouristDeactivated(address indexed deactivator, address indexed tourist);
    event TouristDeleted(address indexed deleter, address indexed tourist);
    event IssuerRoleGranted(address indexed admin, address indexed account);
    event IssuerRoleRevoked(address indexed admin, address indexed account);

    /// Custom errors (cheaper than revert strings)
    error ZeroAddressNotAllowed();
    error TouristAlreadyExists(address tourist);
    error TouristNotFound(address tourist);
    error InvalidValidityDuration();
    error NotActiveOrExpired(address tourist);
    error NotAdmin();
    error SameValue();

    /// @notice Constructor: set deployer as default admin.
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // -----------------------
    // Modifiers & utilities
    // -----------------------

    /// @dev internal: validate non-zero address.
    function _requireNonZero(address _addr) internal pure {
        if (_addr == address(0)) revert ZeroAddressNotAllowed();
    }

    /// @dev internal: compute expiry safely.
    function _computeExpiry(uint256 _durationSeconds) internal view returns (uint256) {
        // duration must be > 0; overflow extremely unlikely with 256-bit arithmetic and block.timestamp.
        return block.timestamp + _durationSeconds;
    }

    // -----------------------
    // Role management (admin)
    // -----------------------

    /// @notice Grant ID_ISSUER_ROLE to an account (only admin).
    /// @param account The account to grant issuer rights to.
    function grantIssuerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _requireNonZero(account);
        grantRole(ID_ISSUER_ROLE, account);
        emit IssuerRoleGranted(msg.sender, account);
    }

    /// @notice Revoke ID_ISSUER_ROLE from an account (only admin).
    /// @param account The account to revoke issuer rights from.
    function revokeIssuerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _requireNonZero(account);
        revokeRole(ID_ISSUER_ROLE, account);
        emit IssuerRoleRevoked(msg.sender, account);
    }

    // -----------------------
    // Core functionality
    // -----------------------

    /// @notice Register a new tourist identity.
    /// @dev Only callable by accounts with ID_ISSUER_ROLE and when not paused.
    /// @param _touristAddress The tourist's wallet address (must not exist already).
    /// @param _kycHash SHA-256 or similar hash of KYC data (off-chain storage).
    /// @param _itineraryHash Hash of itinerary (off-chain storage).
    /// @param _validityDuration Duration in seconds for which the ID will be valid (> 0).
    function registerTourist(
        address _touristAddress,
        bytes32 _kycHash,
        bytes32 _itineraryHash,
        uint256 _validityDuration
    ) external onlyRole(ID_ISSUER_ROLE) whenNotPaused {
        _requireNonZero(_touristAddress);
        if (_touristData[_touristAddress].walletAddress != address(0)) revert TouristAlreadyExists(_touristAddress);
        if (_validityDuration == 0) revert InvalidValidityDuration();

        uint256 expiry = _computeExpiry(_validityDuration);

        _touristData[_touristAddress] = Tourist({
            walletAddress: _touristAddress,
            kycDataHash: _kycHash,
            itineraryHash: _itineraryHash,
            registrationDate: block.timestamp,
            expiryDate: expiry,
            isActive: true
        });

        emit TouristRegistered(msg.sender, _touristAddress, expiry, _kycHash);
    }

    /// @notice Update KYC hash for a tourist.
    /// @dev Only ID_ISSUER_ROLE may call; preserves registrationDate and expiry unless explicitly renewed.
    /// @param _touristAddress The tourist address.
    /// @param _newKycHash New kycDataHash.
    function updateKycHash(address _touristAddress, bytes32 _newKycHash) external onlyRole(ID_ISSUER_ROLE) whenNotPaused {
        Tourist storage t = _touristData[_touristAddress];
        if (t.walletAddress == address(0)) revert TouristNotFound(_touristAddress);
        if (!t.isActive || block.timestamp > t.expiryDate) revert NotActiveOrExpired(_touristAddress);

        if (t.kycDataHash == _newKycHash) revert SameValue();
        t.kycDataHash = _newKycHash;

        emit TouristUpdated(msg.sender, _touristAddress, t.kycDataHash, t.itineraryHash, t.expiryDate);
    }

    /// @notice Update itinerary hash for a tourist.
    /// @dev Only ID_ISSUER_ROLE may call.
    /// @param _touristAddress The tourist address.
    /// @param _newItineraryHash New itinerary hash.
    function updateItineraryHash(address _touristAddress, bytes32 _newItineraryHash) external onlyRole(ID_ISSUER_ROLE) whenNotPaused {
        Tourist storage t = _touristData[_touristAddress];
        if (t.walletAddress == address(0)) revert TouristNotFound(_touristAddress);
        if (!t.isActive || block.timestamp > t.expiryDate) revert NotActiveOrExpired(_touristAddress);

        if (t.itineraryHash == _newItineraryHash) revert SameValue();
        t.itineraryHash = _newItineraryHash;

        emit TouristUpdated(msg.sender, _touristAddress, t.kycDataHash, t.itineraryHash, t.expiryDate);
    }

    /// @notice Renew the validity of an existing tourist ID (extend expiry).
    /// @dev Only ID_ISSUER_ROLE may call.
    /// @param _touristAddress The tourist address.
    /// @param _additionalDuration Seconds to add to the current expiry (must be > 0).
    function renewTourist(address _touristAddress, uint256 _additionalDuration) external onlyRole(ID_ISSUER_ROLE) whenNotPaused {
        if (_additionalDuration == 0) revert InvalidValidityDuration();

        Tourist storage t = _touristData[_touristAddress];
        if (t.walletAddress == address(0)) revert TouristNotFound(_touristAddress);
        if (!t.isActive) revert NotActiveOrExpired(_touristAddress);

        // If already expired, allow renewal from now or treat differently depending on policy.
        uint256 base = block.timestamp > t.expiryDate ? block.timestamp : t.expiryDate;
        unchecked {
            t.expiryDate = base + _additionalDuration;
        }

        emit TouristUpdated(msg.sender, _touristAddress, t.kycDataHash, t.itineraryHash, t.expiryDate);
    }

    /// @notice Deactivate a tourist ID (soft revoke). Keeps the record but marks inactive.
    /// @dev Only ID_ISSUER_ROLE may call.
    /// @param _touristAddress The tourist's address.
    function deactivateTourist(address _touristAddress) external onlyRole(ID_ISSUER_ROLE) {
        Tourist storage t = _touristData[_touristAddress];
        if (t.walletAddress == address(0)) revert TouristNotFound(_touristAddress);
        if (!t.isActive) revert SameValue();

        t.isActive = false;
        emit TouristDeactivated(msg.sender, _touristAddress);
    }

    /// @notice Permanently delete a tourist record.
    /// @dev Only admin can permanently remove records (use carefully).
    /// @param _touristAddress The tourist address to delete.
    function deleteTourist(address _touristAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Tourist storage t = _touristData[_touristAddress];
        if (t.walletAddress == address(0)) revert TouristNotFound(_touristAddress);

        // Delete the mapping entry to refund gas (storage clear).
        delete _touristData[_touristAddress];

        emit TouristDeleted(msg.sender, _touristAddress);
    }

    // -----------------------
    // Views
    // -----------------------

    /// @notice Get the tourist record for an address.
    /// @param _touristAddress Address to query.
    /// @return Tourist struct (reverts when not found).
    function getTouristInfo(address _touristAddress) external view returns (Tourist memory) {
        Tourist memory t = _touristData[_touristAddress];
        if (t.walletAddress == address(0)) revert TouristNotFound(_touristAddress);
        return t;
    }

    /// @notice Check whether a tourist ID is currently valid (active && not expired).
    /// @param _touristAddress Address to check.
    /// @return True if active and not expired.
    function isTouristValid(address _touristAddress) external view returns (bool) {
        Tourist memory t = _touristData[_touristAddress];
        if (t.walletAddress == address(0)) return false;
        return t.isActive && (block.timestamp <= t.expiryDate);
    }

    // -----------------------
    // Pause / Unpause (admin)
    // -----------------------

    /// @notice Pause contract (disables registration and updates).
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
        emit Paused(msg.sender);
    }

    /// @notice Unpause contract.
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
        emit Unpaused(msg.sender);
    }

    // -----------------------
    // Overrides
    // -----------------------

    /// @inheritdoc	ERC165
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}