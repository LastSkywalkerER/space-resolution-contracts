import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
    tables: {
        Bullets: "uint256",
        PlayerPosition: {
            valueSchema: {
                x: "int256",
                y: "int256",
                z: "int256",
            },
        },
        Ethers: {
            valueSchema: {
                amount: "uint256",
                wreckedAmount: "uint256",
            },
        },
        EthersArrangement: {
            keySchema: {
                entityId: "bytes32",
                etherId: "uint256",
            },
            valueSchema: {
                x: "int256",
                y: "int256",
                z: "int256",
            },
        },
    },
});
