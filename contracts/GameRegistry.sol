// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IGameRegistry} from "./interfaces/IGameRegistry.sol";
import {Position, PlayerStats, PlayerStatsResponse} from "./interfaces/Types.sol";

contract GameRegistry is IGameRegistry, AccessControl {
    mapping(address => PlayerStats) private _playersStats;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addEthers(address player_, Position[] calldata ethersPosition_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_playersStats[player_].ethersAmount == 0, "There are some ethers");

        uint256 amount = ethersPosition_.length;

        _playersStats[player_].ethersAmount = amount;

        for (uint256 i = 0; i < amount; ) {
            _playersStats[player_].ethersPosition[i] = ethersPosition_[i];

            unchecked {
                ++i;
            }
        }
    }

    function updatePlayerPosition(
        address player_,
        Position calldata newPosition_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _playersStats[player_].currentPosition = newPosition_;
    }

    function removeBullets(address player_, uint256 amount_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_playersStats[player_].bullets >= amount_, "No more bullets");

        _playersStats[player_].bullets -= amount_;
    }

    function removeEther(address player_, uint256[] calldata ids_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 removeAmount = ids_.length;

        require(
            _playersStats[player_].ethersAmount >= _playersStats[player_].wreckedEthers + removeAmount,
            "No more ethers"
        );

        for (uint256 i = 0; i < removeAmount; ) {
            delete _playersStats[player_].ethersPosition[i];

            unchecked {
                ++i;
            }
        }

        _playersStats[player_].wreckedEthers += removeAmount;
    }

    function addBullets(address player_, uint256 amount_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _playersStats[player_].bullets += amount_;
    }

    function getGameData(address player_) external view returns (PlayerStatsResponse memory response) {
        uint256 liveEthersAmount = _playersStats[player_].ethersAmount - _playersStats[player_].wreckedEthers;
        Position[] memory ethersPositionArray = new Position[](liveEthersAmount);
        uint256[] memory ethersIdArray = new uint256[](liveEthersAmount);
        uint256 pushId;

        for (uint256 i = 0; i < _playersStats[player_].ethersAmount && pushId < liveEthersAmount; ) {
            if (_playersStats[player_].ethersPosition[i].x != 0) {
                ethersPositionArray[pushId] = _playersStats[player_].ethersPosition[i];
                ethersIdArray[pushId] = i;

                unchecked {
                    ++pushId;
                }
            }

            unchecked {
                ++i;
            }
        }

        response = PlayerStatsResponse({
            bullets: _playersStats[player_].bullets,
            currentPosition: _playersStats[player_].currentPosition,
            ethersAmount: _playersStats[player_].ethersAmount,
            ethersPosition: ethersPositionArray,
            ethersId: ethersIdArray,
            wreckedEthers: _playersStats[player_].wreckedEthers
        });
    }
}
