// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import {ShipSpecs} from "./Types.sol";

interface IShip is IERC721 {
    function shipSpecsByTokenId(uint256 tokenId) external view returns (ShipSpecs memory);
}
