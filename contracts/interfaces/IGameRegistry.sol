// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Position, PlayerStats, PlayerStatsResponse} from "./Types.sol";

interface IGameRegistry {
    function addEthers(address player_, Position[] calldata ethersPosition_) external;

    function updatePlayerPosition(address player_, Position calldata newPosition_) external;

    function removeBullets(address player_, uint256 amount_) external;

    function removeEther(address player_, uint256[] calldata ids_) external;

    function addBullets(address player_, uint256 amount_) external;

    function getGameData(address player_) external view returns (PlayerStatsResponse memory response);
}
