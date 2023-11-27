// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

import {IGameRegistry} from "./interfaces/IGameRegistry.sol";
import {Position, PlayerStats, PlayerStatsResponse} from "./interfaces/Types.sol";

contract GameLogic {
    IGameRegistry gameRegistry;

    constructor(address gameRegistry_) {
        gameRegistry = IGameRegistry(gameRegistry_);
    }

    function start(Position[] calldata ethersPosition_) external {
        gameRegistry.initPlayer(msg.sender, ethersPosition_);
    }

    function buyBullets(uint amount_) external payable {
        gameRegistry.buyBullets(msg.sender, amount_);
    }

    function getGameData() external view returns (PlayerStatsResponse memory) {
        return gameRegistry.getGameData(msg.sender);
    }

    function registerAction(
        uint[] calldata etherIds_,
        uint bulletsAmount_,
        Position calldata newPlayerPosition_
    ) external {
        if (bulletsAmount_ > 0) {
            gameRegistry.removeBullets(msg.sender, bulletsAmount_);
        }

        if (etherIds_.length > 0) {
            gameRegistry.removeEther(msg.sender, etherIds_);
        }

        if (newPlayerPosition_.x != 0 && newPlayerPosition_.y != 0 && newPlayerPosition_.z != 0) {
            gameRegistry.updatePlayerPosition(msg.sender, newPlayerPosition_);
        }
    }
}
