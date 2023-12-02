import { ethers, network } from "hardhat";
import { GameRegistry, Ship } from "../typechain-types";
import { verify } from "./verify";
import { BigNumber } from "ethers";
import { ShipSpecsStruct } from "../typechain-types/contracts/Ship";

async function main() {
    const [deployer] = await ethers.getSigners();

    const ship = await deployShip({
        collectionName: "Ship",
        symbol: "SHIP",
        admin: deployer.address,
        minter: deployer.address,
        metadata: "https://bafybeidflub7enoe3qvt37iucb6kvuvnki7o5ww5rlpzgrnbsgn4w7j4wq.ipfs.w3s.link/shipMetadata.json",
        shipSpecs: {
            MOVE_SPEED: 1000,
            MOVE_ANGLE_SPEED: 5000,
            SHIP_MASS: 1000,
            LINEAR_DAMPING: 50,
            ANGULAR_DAMPING: 150,
            FIRE_RATE: 38000,
            WEAPON_OFFSET: {
                x: 0,
                y: 100,
                z: -300,
            },
        },
    });
    const registry = await deployGameRegistry();
    // const registry = await ethers.getContractAt("GameRegistry", "0x8595607A33b6e54ac05607Ca8C63e75733719553", deployer);
    await deployGameLogic({
        registry,
        ship,
        bulletPrice: ethers.utils.parseEther("0.0001"),
        balanceReceiver: deployer.address,
        feeRate: 500,
        winRate: 7500,
        domainName: "GameLogic",
        domainVersion: "1",
    });
}

async function deployShip({
    collectionName,
    symbol,
    admin,
    minter,
    metadata,
    shipSpecs,
}: {
    collectionName: string;
    symbol: string;
    admin: string;
    minter: string;
    metadata: string;
    shipSpecs: ShipSpecsStruct;
}) {
    console.log(`Deploying Ship to ${network.name} blockchain...`);

    const contractFactory = await ethers.getContractFactory("Ship");
    const args = [collectionName, symbol, admin, minter] as const;

    const contract = (await contractFactory.deploy(...args)) as Ship;
    await contract.deployed();
    console.log(`Ship deployed to ${contract.address}.`);

    await (await contract.safeMint(minter, metadata, shipSpecs)).wait();
    console.log("Ship minted");

    await verify(contract.address, args, "contracts/Ship.sol:Ship");

    return contract;
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
    ship,
    bulletPrice,
    balanceReceiver,
    winRate,
    feeRate,
    domainName,
    domainVersion,
}: {
    registry: GameRegistry;
    ship: Ship;
    bulletPrice: BigNumber;
    balanceReceiver: string;
    winRate: number;
    feeRate: number;
    domainName: string;
    domainVersion: string;
}): Promise<void> {
    console.log(`Deploying GameLogic to ${network.name} blockchain...`);

    const contractFactory = await ethers.getContractFactory("GameLogic");
    const args = [
        registry.address,
        ship.address,
        bulletPrice,
        balanceReceiver,
        winRate,
        feeRate,
        domainName,
        domainVersion,
    ] as const;

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
