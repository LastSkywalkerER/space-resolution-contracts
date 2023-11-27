import { ethers, network } from 'hardhat';
import { BigNumber } from 'ethers';
import { PushinCatalog, PushinEquippable, RMRKEquipRenderUtils } from '../typechain-types';
import { verify } from './verify';


async function main() {
  await deployEquippable(
    "PushinPetsTest", 
    "PPETST", 
    "https://bafybeibjl2zfsh3nr3otryd6ougusuzroq6vyz6h3d4arb43h5vrcnpvxy.ipfs.w3s.link/pet.json",
    BigNumber.from(1000),
    "0xAc10992D841F6F2F75bD782BAa6ec17755C73f66",
    BigNumber.from(0)
  );

  await deployEquippable(
    "PushinGunsTest", 
    "PGUNST", 
    "https://bafybeiddinptievdgsrcdnmuli77yebhelhdbftlfewolwy6hnbahjyxke.ipfs.w3s.link/gun.json",
    BigNumber.from(2000),
    "0xAc10992D841F6F2F75bD782BAa6ec17755C73f66",
    BigNumber.from(0)
  );

  await deployCatalog(
    "PCATALOG",
    "svg"
  );

  await deployViews();
}

async function deployEquippable(
  collectionName: string, 
  symbol: string, 
  metadata: string, 
  maxSupply: BigNumber, 
  royaltyRecepient: string, 
  royaltyPercentageBps: BigNumber): Promise<void> 
{
  console.log(`Deploying PushinEquippable to ${network.name} blockchain...`);

  const contractFactory = await ethers.getContractFactory("PushinEquippable");
  const args = [
    collectionName,
    symbol,
    metadata,
    maxSupply,
    royaltyRecepient,
    royaltyPercentageBps
  ] as const;

  const contract: PushinEquippable = await contractFactory.deploy(...args) as PushinEquippable;
  await contract.deployed();
  console.log(`PushinEquippable deployed to ${contract.address}.`);

  // Only do on testing, or if whitelisted for production
  // const registry = await getRegistry();
  // await registry.addExternalCollection(contract.address, args[0]);
  // console.log('Collection added to Singular Registry');

  const chainId = (await ethers.provider.getNetwork()).chainId;
  if (chainId === 31337) {
    console.log('Skipping verify on local chain');
    return;
  }

  await verify(contract.address, args, "contracts/PushinEquippable.sol:PushinEquippable");
}


async function deployCatalog(metadataURI: string, contractType: string): Promise<void> {
  console.log(`Deploying Catalog to ${network.name} blockchain...`);

  const contractFactory = await ethers.getContractFactory("PushinCatalog");
  const args = [
      metadataURI,
      contractType,
  ] as const;
  const contract: PushinCatalog = await contractFactory.deploy(...args) as PushinCatalog;
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

  await verify(contract.address, args, "contracts/PushinCatalog.sol:PushinCatalog");
}


async function deployViews() {
  console.log(`Deploying Views to ${network.name} blockchain...`);

  const viewsFactory = await ethers.getContractFactory("RMRKEquipRenderUtils");
  const contract: RMRKEquipRenderUtils = await viewsFactory.deploy();
  await contract.deployed();
  console.log(`Views deployed to ${contract.address}.`);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});