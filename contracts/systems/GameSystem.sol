// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import {System} from "@latticexyz/world/src/System.sol";
import {PlayerPosition, PlayerPositionData, Bullets, Ethers, EthersData, EthersArrangement, EthersArrangementData} from "../codegen/index.sol";
import {Position, PlayerStats, PlayerStatsResponse} from "../interfaces/Types.sol";

contract GameSystem is System {
    uint public bulletPrice = 0.001 ether;

    function start(Position[] calldata ethersPosition_) external {
        bytes32 entityId = bytes32(uint256(uint160((_msgSender()))));

        EthersData memory ethers = Ethers.get(entityId);
        require(ethers.amount <= ethers.wreckedAmount, "Game is not over");

        uint amount = ethersPosition_.length;
        Ethers.setAmount(entityId, amount);

        for (uint i = 0; i < amount; ) {
            EthersArrangement.set(
                entityId,
                i,
                EthersArrangementData({x: ethersPosition_[i].x, y: ethersPosition_[i].y, z: ethersPosition_[i].z})
            );

            unchecked {
                ++i;
            }
        }
    }

    function buyBullets(uint amount_) external payable {
        require(amount_ * bulletPrice <= msg.value, "Not enough funds");

        bytes32 entityId = bytes32(uint256(uint160((_msgSender()))));

        uint256 bullets = Bullets.get(entityId);
        Bullets.set(entityId, bullets + amount_);
    }

    function getGameData() external view returns (PlayerStatsResponse memory) {
        bytes32 entityId = bytes32(uint256(uint160((_msgSender()))));

        EthersData memory ethers = Ethers.get(entityId);

        uint liveEthersAmount = ethers.amount - ethers.wreckedAmount;
        Position[] memory ethersPositionArray = new Position[](liveEthersAmount);
        uint[] memory ethersIdArray = new uint[](liveEthersAmount);
        uint pushId;

        for (uint i = 0; i < ethers.amount && pushId < liveEthersAmount; ) {
            if (
                EthersArrangement.get(entityId, i).x != 0 &&
                EthersArrangement.get(entityId, i).y != 0 &&
                EthersArrangement.get(entityId, i).z != 0
            ) {
                ethersPositionArray[pushId] = Position({
                    x: EthersArrangement.get(entityId, i).x,
                    y: EthersArrangement.get(entityId, i).y,
                    z: EthersArrangement.get(entityId, i).z
                });
                ethersIdArray[pushId] = i;

                unchecked {
                    ++pushId;
                }
            }

            unchecked {
                ++i;
            }
        }

        return
            PlayerStatsResponse({
                bullets: Bullets.get(entityId),
                currentPosition: Position({
                    x: PlayerPosition.get(entityId).x,
                    y: PlayerPosition.get(entityId).y,
                    z: PlayerPosition.get(entityId).z
                }),
                ethersAmount: ethers.amount,
                ethersPosition: ethersPositionArray,
                ethersId: ethersIdArray,
                wreckedEthers: ethers.wreckedAmount
            });
    }

    function registerAction(
        uint[] calldata removeEtherIds_,
        uint shotBulletsAmount_,
        Position calldata newPlayerPosition_
    ) external {
        bytes32 entityId = bytes32(uint256(uint160((_msgSender()))));

        if (shotBulletsAmount_ > 0) {
            uint256 bullets = Bullets.get(entityId);
            require(bullets >= shotBulletsAmount_, "No more bullets");

            Bullets.set(entityId, bullets - shotBulletsAmount_);
        }

        if (removeEtherIds_.length > 0) {
            uint256 wreckedAmount = removeEtherIds_.length;

            EthersData memory ethers = Ethers.get(entityId);
            require(ethers.amount >= ethers.wreckedAmount + wreckedAmount, "No more ethers");

            Ethers.setWreckedAmount(entityId, ethers.wreckedAmount + wreckedAmount);

            for (uint i = 0; i < wreckedAmount; ) {
                EthersArrangement.set(entityId, i, EthersArrangementData(0, 0, 0));

                unchecked {
                    ++i;
                }
            }
        }

        if (newPlayerPosition_.x != 0 && newPlayerPosition_.y != 0 && newPlayerPosition_.z != 0) {
            PlayerPosition.set(entityId, newPlayerPosition_.x, newPlayerPosition_.y, newPlayerPosition_.z);
        }
    }
}
