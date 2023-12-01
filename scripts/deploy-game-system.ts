import { ethers, network } from "hardhat";
import { GameSystem } from "../typechain-types";
import { verify } from "./verify";

async function main() {
    await deployGame();
}

async function deployGame(): Promise<void> {
    console.log(`Deploying game to ${network.name} blockchain...`);

    const contractFactory = await ethers.getContractFactory("GameSystem");
    const args = [] as const;

    const contract = (await contractFactory.deploy(...args)) as GameSystem;
    await contract.deployed();
    console.log(`game deployed to ${contract.address}.`);

    await verify(contract.address, args, "contracts/systems/GameSystem.sol:GameSystem");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
