import { ethers, network } from "hardhat";
import { BigNumber } from "ethers";
import { Ship } from "../typechain-types";
import { verify } from "./verify";

async function main() {
    await deployEquippable(
        "Ship",
        "Ship",
        "https://bafybeidflub7enoe3qvt37iucb6kvuvnki7o5ww5rlpzgrnbsgn4w7j4wq.ipfs.w3s.link/shipMetadata.json",
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
    console.log(`Deploying Ship to ${network.name} blockchain...`);

    const contractFactory = await ethers.getContractFactory("Ship");
    const args = [collectionName, symbol, metadata, maxSupply, royaltyRecepient, royaltyPercentageBps] as const;

    const contract = (await contractFactory.deploy(...args)) as Ship;
    await contract.deployed();
    console.log(`Ship deployed to ${contract.address}.`);

    await (
        await contract.mint(
            "0x71e536C6eB7e124FFfB81805568c7cAc8cc0be7e",
            1,
            "https://bafybeidflub7enoe3qvt37iucb6kvuvnki7o5ww5rlpzgrnbsgn4w7j4wq.ipfs.w3s.link/shipMetadata.json",
        )
    ).wait();
    console.log("Ship minted");

    const chainId = (await ethers.provider.getNetwork()).chainId;
    if (chainId === 31337) {
        console.log("Skipping verify on local chain");
        return;
    }

    await verify(contract.address, args, "contracts/Ship.sol:Ship");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
