import { ethers, network } from "hardhat";
import { BigNumber } from "ethers";
import { Ether } from "../typechain-types";
import { verify } from "./verify";

async function main() {
    await deployEquippable(
        "Ether",
        "Ether",
        "https://bafybeihy7dz5vtilhbdzdj2msams46ycacrlecaoqjmh2c3laany32xpoq.ipfs.w3s.link/etherMetadata.json",
        BigNumber.from(1),
        "0x71e536C6eB7e124FFfB81805568c7cAc8cc0be7e",
        BigNumber.from(1000),
    );
}

async function deployEquippable(
    collectionName: string,
    symbol: string,
    metadata: string,
    maxSupply: BigNumber,
    royaltyRecepient: string,
    royaltyPercentageBps: BigNumber,
): Promise<void> {
    console.log(`Deploying Ether to ${network.name} blockchain...`);

    const contractFactory = await ethers.getContractFactory("Ether");
    const args = [collectionName, symbol, metadata, maxSupply, royaltyRecepient, royaltyPercentageBps] as const;

    const contract = (await contractFactory.deploy(...args)) as Ether;
    await contract.deployed();
    console.log(`Ether deployed to ${contract.address}.`);

    await (
        await contract.mint(
            "0x71e536C6eB7e124FFfB81805568c7cAc8cc0be7e",
            1,
            "https://bafybeihy7dz5vtilhbdzdj2msams46ycacrlecaoqjmh2c3laany32xpoq.ipfs.w3s.link/etherMetadata.json",
        )
    ).wait();
    console.log("Ether minted");

    const chainId = (await ethers.provider.getNetwork()).chainId;
    if (chainId === 31337) {
        console.log("Skipping verify on local chain");
        return;
    }

    await verify(contract.address, args, "contracts/Ether.sol:Ether");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
