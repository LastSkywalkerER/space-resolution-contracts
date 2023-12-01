import { ethers, network } from "hardhat";
import { GameRegistry, GameSystem } from "../typechain-types";
import { verify } from "./verify";
import { BigNumber } from "ethers";

async function main() {
    const [deployer] = await ethers.getSigners();

    // const registry = await deployGameRegistry();
    const registry = await ethers.getContractAt("GameRegistry", "0x8595607A33b6e54ac05607Ca8C63e75733719553", deployer);
    await deployGameLogic({
        registry,
        bulletPrice: ethers.utils.parseEther("0.0001"),
        balanceReceiver: deployer.address,
        feeRate: 500,
        winRate: 7500,
    });
}

async function deployGameRegistry() {
    console.log(`Deploying GameRegistry to ${network.name} blockchain...`);

    const contractFactory = await ethers.getContractFactory("GameRegistry");
    const args = [] as const;

    const contract = await contractFactory.deploy(...args);
    await contract.deployed();
    console.log(`GameRegistry deployed to ${contract.address}.`);

    await verify(contract.address, args, "contracts/GameRegistry.sol:GameRegistry");

    return contract;
}

async function deployGameLogic({
    registry,
    bulletPrice,
    balanceReceiver,
    winRate,
    feeRate,
}: {
    registry: GameRegistry;
    bulletPrice: BigNumber;
    balanceReceiver: string;
    winRate: number;
    feeRate: number;
}): Promise<void> {
    console.log(`Deploying GameLogic to ${network.name} blockchain...`);

    const contractFactory = await ethers.getContractFactory("GameLogic");
    const args = [registry.address, bulletPrice, balanceReceiver, winRate, feeRate] as const;

    const contract = await contractFactory.deploy(...args);
    await contract.deployed();
    console.log(`GameLogic deployed to ${contract.address}.`);

    const tx = await registry.grantRole(await registry.DEFAULT_ADMIN_ROLE(), contract.address);
    await tx.wait();

    await verify(contract.address, args, "contracts/GameLogic.sol:GameLogic");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
