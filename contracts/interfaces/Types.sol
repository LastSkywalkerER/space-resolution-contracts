// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

struct Position {
    int256 x;
    int256 y;
    int256 z;
}

struct PlayerStats {
    uint256 bullets;
    Position currentPosition;
    uint256 ethersAmount;
    mapping(uint256 => Position) ethersPosition;
    uint256 wreckedEthers;
}

struct PlayerStatsResponse {
    uint256 bullets;
    Position currentPosition;
    uint256 ethersAmount;
    Position[] ethersPosition;
    uint256[] ethersId;
    uint256 wreckedEthers;
}
