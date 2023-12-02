// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import {IGameRegistry} from "./interfaces/IGameRegistry.sol";
import {IShip} from "./interfaces/IShip.sol";
import {Position, PlayerStats, PlayerStatsResponse, Bullet, VerificationData} from "./interfaces/Types.sol";

contract GameLogic is EIP712 {
    using ECDSA for bytes32;

    bytes32 internal constant SHIP_OWNER_TYPE_HASH = keccak256("ShipOwnership(address gameWallet,uint256 tokenId)");

    IGameRegistry public gameRegistry;
    IShip public ship;

    uint256 public bulletPrice;
    uint16 public PERCENT_BASE = 10000;
    uint8 public SPECS_MULTIPLIER = 100;

    address private _balanceReceiver;
    uint256 private _winRate;
    uint256 private _feeRate;

    constructor(
        address gameRegistry_,
        address ship_,
        uint256 bulletPrice_,
        address balanceReceiver_,
        uint256 winRate_,
        uint256 feeRate_,
        string memory domainName_,
        string memory domainVersion_
    ) EIP712(domainName_, domainVersion_) {
        gameRegistry = IGameRegistry(gameRegistry_);
        ship = IShip(ship_);

        bulletPrice = bulletPrice_;
        _balanceReceiver = balanceReceiver_;
        _winRate = winRate_;
        _feeRate = feeRate_;
    }

    modifier onlyShipOwner(VerificationData calldata verificationData) {
        if (verificationData.signature.length > 0) {
            address signer = _hashTypedDataV4(
                keccak256(abi.encode(SHIP_OWNER_TYPE_HASH, msg.sender, verificationData.tokenId))
            ).recover(verificationData.signature);

            require(ship.ownerOf(verificationData.tokenId) == signer, "You do not have a ship");
        } else {
            require(ship.ownerOf(verificationData.tokenId) == msg.sender, "You do not have a ship");
        }

        _;
    }

    function start(Position[] calldata ethersPosition_) external {
        gameRegistry.addEthers(msg.sender, ethersPosition_);
    }

    function buyBullets(uint256 amount_) external payable {
        require(amount_ * bulletPrice <= msg.value, "Not enough funds");

        uint256 feeAmount = (msg.value * _feeRate) / PERCENT_BASE;

        (bool sent, ) = payable(_balanceReceiver).call{value: feeAmount}("");

        require(sent, "Fund transfer failure");

        gameRegistry.addBullets(msg.sender, amount_);
    }

    function getGameData() external view returns (PlayerStatsResponse memory) {
        return gameRegistry.getGameData(msg.sender);
    }

    function hitRegister(
        uint256[] calldata etherIds_,
        Bullet[] calldata bullets_,
        Position calldata newPlayerPosition_
    ) external {
        uint256 bulletsAmount = bullets_.length;
        uint256 hitAmount;

        for (uint256 i; i < bulletsAmount; ) {
            if (bullets_[i].endPosition.x != 0 && bullets_[i].endPosition.y != 0 && bullets_[i].endPosition.z != 0) {
                unchecked {
                    ++hitAmount;
                }
            }

            unchecked {
                ++i;
            }
        }

        if (bullets_.length > 0) {
            gameRegistry.removeBullets(msg.sender, bullets_.length);
        }

        if (newPlayerPosition_.x != 0 && newPlayerPosition_.y != 0 && newPlayerPosition_.z != 0) {
            gameRegistry.updatePlayerPosition(msg.sender, newPlayerPosition_);
        }

        if (hitAmount == etherIds_.length && hitAmount > 0) {
            gameRegistry.removeEther(msg.sender, etherIds_);

            uint256 winAmount = (bulletPrice / _winRate) * PERCENT_BASE;

            (bool sent, ) = payable(msg.sender).call{value: winAmount}("");
            require(sent, "Fund transfer failure");
        }
    }

    fallback() external payable {
        revert("Not implemented");
    }

    receive() external payable {
        revert("Not implemented");
    }
}
