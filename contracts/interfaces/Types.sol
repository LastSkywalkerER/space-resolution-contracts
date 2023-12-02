// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

struct Position {
    int256 x;
    int256 y;
    int256 z;
}

struct Bullet {
    Position startPosition;
    Position endPosition;
    uint256 id;
    // uint256 angle;
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

struct ShipSpecs {
    uint16 MOVE_SPEED;
    uint16 MOVE_ANGLE_SPEED;
    uint16 SHIP_MASS;
    uint16 LINEAR_DAMPING;
    uint16 ANGULAR_DAMPING;
    uint16 FIRE_RATE;
    Position WEAPON_OFFSET;
}

struct VerificationData {
    bytes signature;
    uint256 tokenId;
}
