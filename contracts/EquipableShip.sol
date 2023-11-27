// SPDX-License-Identifier: MIT

pragma solidity ^0.8.21;
import "@rmrk-team/evm-contracts/contracts/implementations/abstract/RMRKAbstractEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/implementations/utils/RMRKTokenURIPerToken.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKEquipRenderUtils.sol";

contract EquipableShip is RMRKAbstractEquippable, RMRKTokenURIPerToken {
    struct Specs {
        uint16 MOVE_SPEED;
        uint16 MOVE_ANGLE_SPEED;
        uint16 SHIP_MASS;
        uint16 LINEAR_DAMPING;
        uint16 ANGULAR_DAMPING;
        uint16 FIRE_RATE;
        int16[3] WEAPON_OFFSET;
    }
    // Variables
    Specs public specs;

    // Constructor
    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadata,
        uint256 maxSupply,
        address royaltyRecipient,
        uint16 royaltyPercentageBps
    ) RMRKImplementationBase(name, symbol, collectionMetadata, maxSupply, royaltyRecipient, royaltyPercentageBps) {
        int16[3] memory WEAPON_OFFSET;
        WEAPON_OFFSET[0] = 0;
        WEAPON_OFFSET[1] = 1;
        WEAPON_OFFSET[2] = -3;
        specs = Specs(1000, 5000, 1000, 50, 150, 38000, WEAPON_OFFSET);
    }

    // Methods
    // Suggested Mint Functions
    /**
     * @notice Used to mint the desired number of tokens to the specified address.
     * @dev The data value of the _safeMint method is set to an empty value.
     * @dev Can only be called while the open sale is open.
     * @param to Address to which to mint the token
     * @param numToMint Number of tokens to mint
     * @param tokenURI URI assigned to all the minted tokens
     * @return The ID of the first token to be minted in the current minting cycle
     */
    function mint(
        address to,
        uint256 numToMint,
        string memory tokenURI
    ) public onlyOwnerOrContributor returns (uint256) {
        (uint256 nextToken, uint256 totalSupplyOffset) = _prepareMint(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _setTokenURI(i, tokenURI);
            _safeMint(to, i, "");
            unchecked {
                ++i;
            }
        }

        return nextToken;
    }

    /**
     * @notice Used to mint a desired number of child tokens to a given parent token.
     * @dev The "data" value of the "_safeMint" method is set to an empty value.
     * @dev Can only be called while the open sale is open.
     * @param to Address of the collection smart contract of the token into which to mint the child token
     * @param numToMint Number of tokens to mint
     * @param destinationId ID of the token into which to mint the new child token
     * @param tokenURI URI assigned to all the minted tokens
     * @return The ID of the first token to be minted in the current minting cycle
     */
    function nestMint(
        address to,
        uint256 numToMint,
        uint256 destinationId,
        string memory tokenURI
    ) public onlyOwnerOrContributor returns (uint256) {
        (uint256 nextToken, uint256 totalSupplyOffset) = _prepareMint(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _setTokenURI(i, tokenURI);
            _nestMint(to, i, destinationId, "");
            unchecked {
                ++i;
            }
        }

        return nextToken;
    }

    function setTokenURI(uint256 tokenId, string memory tokenURI_) public onlyOwnerOrContributor {
        _setTokenURI(tokenId, tokenURI_);
    }
}
