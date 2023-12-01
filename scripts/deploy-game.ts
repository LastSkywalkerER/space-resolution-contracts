import { ethers, network } from "hardhat";
import { GameSystem } from "../typechain-types";
import { verify } from "./verify";
import { BigNumber } from "ethers";

async function main() {
    const address = await deployGameRegistry({ bulletPrice: ethers.utils.parseEther("0.001") });
    await deployGameLogic({ registryAddress: address });
}

async function deployGameRegistry({ bulletPrice }: { bulletPrice: BigNumber }): Promise<string> {
    console.log(`Deploying GameRegistry to ${network.name} blockchain...`);

    const contractFactory = await ethers.getContractFactory("GameRegistry");
    const args = [bulletPrice] as const;

    const contract = await contractFactory.deploy(...args);
    await contract.deployed();
    console.log(`GameRegistry deployed to ${contract.address}.`);

    await verify(contract.address, args, "contracts/GameRegistry.sol:GameRegistry");

    return contract.address;
}

async function deployGameLogic({ registryAddress }: { registryAddress: string }): Promise<void> {
    console.log(`Deploying GameLogic to ${network.name} blockchain...`);

    const contractFactory = await ethers.getContractFactory("GameLogic");
    const args = [registryAddress] as const;

    const contract = await contractFactory.deploy(...args);
    await contract.deployed();
    console.log(`GameLogic deployed to ${contract.address}.`);

    await verify(contract.address, args, "contracts/GameLogic.sol:GameLogic");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
