// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Position, PlayerStats, PlayerStatsResponse} from "./Types.sol";

interface IGameRegistry {
    function initPlayer(address player_, Position[] calldata ethersPosition_) external;

    function updatePlayerPosition(address player_, Position calldata newPosition_) external;

    function removeBullets(address player_, uint256 amount_) external;

    function removeEther(address player_, uint256[] calldata ids_) external;

    function buyBullets(address player_, uint256 amount_) external payable;

    function getGameData(address player_) external view returns (PlayerStatsResponse memory response);
}
