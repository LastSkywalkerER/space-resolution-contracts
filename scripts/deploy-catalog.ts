import { ethers, run, network } from "hardhat";
import { BigNumber } from "ethers";
import { Catalog } from "../typechain-types";
import { verify } from "./verify";
// import { getRegistry } from "./getRegistry";

async function main() {
    await deployContracts();
}

async function deployContracts(): Promise<void> {
    console.log(`Deploying Catalog to ${network.name} blockchain...`);

    const contractFactory = await ethers.getContractFactory("Catalog");
    const args = [
        "https://bafybeifdz7sdwn7fio4ovkxpbd4zatbtyxrojid6jigki5jjuysvgbkqqa.ipfs.w3s.link/document.json",
        "https://bafybeifdz7sdwn7fio4ovkxpbd4zatbtyxrojid6jigki5jjuysvgbkqqa.ipfs.w3s.link/document.json",
    ] as const;
    const contract: Catalog = await contractFactory.deploy(...args);
    await contract.deployed();
    console.log(`Catalog deployed to ${contract.address}.`);

    // Only do on testing, or if whitelisted for production
    // const registry = await getRegistry();
    // await registry.addExternalCollection(contract.address, args[0]);
    // console.log("Collection added to Singular Registry");

    const chainId = (await ethers.provider.getNetwork()).chainId;
    if (chainId === 31337) {
        console.log("Skipping verify on local chain");
        return;
    }

    await verify(contract.address, args, "contracts/Catalog.sol:Catalog");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
