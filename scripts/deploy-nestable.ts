import { ethers, run, network } from "hardhat";
import { BigNumber } from "ethers";
import { Nestable } from "../typechain-types";
import { verify } from "./verify";
// import { getRegistry } from "./getRegistry";

async function main() {
    await deployContracts();
}

async function deployContracts(): Promise<void> {
    console.log(`Deploying Nestable to ${network.name} blockchain...`);

    const contractFactory = await ethers.getContractFactory("Nestable");
    const args = [
        "Nestable",
        "Nestable",
        "https://bafybeifdz7sdwn7fio4ovkxpbd4zatbtyxrojid6jigki5jjuysvgbkqqa.ipfs.w3s.link/document.json",
        BigNumber.from(10),
        "0x71e536C6eB7e124FFfB81805568c7cAc8cc0be7e",
        100,
    ] as const;
    const contract: Nestable = await contractFactory.deploy(...args);
    await contract.deployed();
    console.log(`Nestable deployed to ${contract.address}.`);

    // Only do on testing, or if whitelisted for production
    // const registry = await getRegistry();
    // await registry.addExternalCollection(contract.address, args[0]);
    // console.log("Collection added to Singular Registry");

    const chainId = (await ethers.provider.getNetwork()).chainId;
    if (chainId === 31337) {
        console.log("Skipping verify on local chain");
        return;
    }

    await verify(contract.address, args);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
