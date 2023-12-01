// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

import {GameRegistry} from "./GameRegistry.sol";
import {Position, PlayerStats, PlayerStatsResponse, Bullet} from "./interfaces/Types.sol";

contract GameLogic {
    GameRegistry public gameRegistry;

    uint256 public bulletPrice;
    uint256 public PERCENT_BASE = 10000;

    address private _balanceReceiver;
    uint256 private _winRate;
    uint256 private _feeRate;

    constructor(
        address gameRegistry_,
        uint256 bulletPrice_,
        address balanceReceiver_,
        uint256 winRate_,
        uint256 feeRate_
    ) {
        gameRegistry = GameRegistry(gameRegistry_);
        bulletPrice = bulletPrice_;
        _balanceReceiver = balanceReceiver_;
        _winRate = winRate_;
        _feeRate = feeRate_;
    }

    function start(Position[] calldata ethersPosition_) external {
        gameRegistry.initPlayer(msg.sender, ethersPosition_);
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
