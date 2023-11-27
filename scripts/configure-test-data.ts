import { ethers } from "hardhat";
import dotenv from "dotenv";
import { ItemType } from "../test/types/types";
import { addAssetToToken, addEntryAssets, configureCatalog, mintTokens, nestMintTokens, setValidParentSlotForChildAssetGroup } from "../test/utils";

const { PRIVATE_KEY } = process.env;

async function main() {
  await configureTestData();
}

async function configureTestData() {
  const owner = (await ethers.getSigners())[0];
  const pet = await ethers.getContractAt("PushinEquippable", "0x6051894F928370a78fC18268c6651F85d7535a9b", owner);
  const gun = await ethers.getContractAt("PushinEquippable", "0x55EEc88ba13A0b9e0073a99684D91E0B9DdbF40D", owner);
  const catalog = await ethers.getContractAt("PushinCatalog", "0x52282feadCA4B36ade537C6B1163fCa887AC20C9", owner);
  const petMetadataURI = "https://bafybeibjl2zfsh3nr3otryd6ougusuzroq6vyz6h3d4arb43h5vrcnpvxy.ipfs.w3s.link/pet.json";
  const gunMetadataURI = "https://bafybeiddinptievdgsrcdnmuli77yebhelhdbftlfewolwy6hnbahjyxke.ipfs.w3s.link/gun.json";
  
  console.log(1);
  
  await mintTokens(pet, owner, 3, [
    petMetadataURI, 
    petMetadataURI, 
    petMetadataURI
  ]);

  console.log(2);

  await nestMintTokens(pet, gun, owner, 1, 3, [
    gunMetadataURI, 
    gunMetadataURI, 
    gunMetadataURI
  ]);

  console.log(3);

  await nestMintTokens(pet, gun, owner, 2, 3, [
    gunMetadataURI, 
    gunMetadataURI, 
    gunMetadataURI
  ]);

  console.log(4);

  await nestMintTokens(pet, gun, owner, 3, 3, [
    gunMetadataURI, 
    gunMetadataURI, 
    gunMetadataURI
  ]);

  console.log(5);

  await configureCatalog(catalog, [
    {
      // Body option 1
      partId: 1,
      part: {
        itemType: ItemType.Fixed,
        z: 1,
        equippable: [],
        metadataURI: "ipfs://body/1.svg",
      },
    },
    {
      // Body option 2
      partId: 2,
      part: {
        itemType: ItemType.Fixed,
        z: 1,
        equippable: [],
        metadataURI: "ipfs://body/2.svg",
      },
    },
    {
      // Gun slot 1
      partId: 3,
      part: {
        itemType: ItemType.Slot,
        z: 2,
        equippable: [gun.address], // Only gun tokens can be equipped here
        metadataURI: "ipfs://gun/1.svg",
      },
    },
    {
      // Gun slot 2
      partId: 4,
      part: {
        itemType: ItemType.Slot,
        z: 2,
        equippable: [gun.address], // Only gun tokens can be equipped here
        metadataURI: "ipfs://gun/2.svg",
      },
    },
  ]);

  console.log(6);

  await addEntryAssets(pet, [
    {
      equippableGroupId: 0,
      catalogAddress: ethers.constants.AddressZero,
      metadataURI: "ipfs://default.png",
      partIds: [],
    },
    {
      equippableGroupId: 1,
      catalogAddress: catalog.address,
      metadataURI: "ipfs://meta1.json",
      partIds: [1, 3, 4],
    }
  ]);

  console.log(7);

  await addAssetToToken(pet, 1, 2, 0);
  await addAssetToToken(pet, 2, 2, 0);
  await addAssetToToken(pet, 3, 2, 0);

  console.log(8);

  await addEntryAssets(gun, [
    {
      equippableGroupId: 0,
      catalogAddress: catalog.address,
      metadataURI: `ipfs://guns/typeA/full.svg`,
      partIds: [],
    },
    {
      equippableGroupId: 1,
      catalogAddress: catalog.address,
      metadataURI: `ipfs://guns/typeA/left.svg`,
      partIds: [],
    },
    {
      equippableGroupId: 2,
      catalogAddress: catalog.address,
      metadataURI: `ipfs://guns/typeA/right.svg`,
      partIds: [],
    },
    {
      equippableGroupId: 0,
      catalogAddress: catalog.address,
      metadataURI: `ipfs://guns/typeB/full.svg`,
      partIds: [],
    },
    {
      equippableGroupId: 1,
      catalogAddress: catalog.address,
      metadataURI: `ipfs://guns/typeB/left.svg`,
      partIds: [],
    },
    {
      equippableGroupId: 2,
      catalogAddress: catalog.address,
      metadataURI: `ipfs://guns/typeB/right.svg`,
      partIds: [],
    },
  ]);

  console.log(9);
  
  await setValidParentSlotForChildAssetGroup(gun, 1, pet, 3);
  await setValidParentSlotForChildAssetGroup(gun, 2, pet, 4);

  console.log(10);

  await addAssetToToken(gun, 1, 1, 0);
  await addAssetToToken(gun, 1, 2, 0);
  await addAssetToToken(gun, 1, 3, 0);
  await addAssetToToken(gun, 2, 1, 0);
  await addAssetToToken(gun, 2, 2, 0);
  await addAssetToToken(gun, 2, 3, 0);
  await addAssetToToken(gun, 3, 4, 0);
  await addAssetToToken(gun, 3, 5, 0);
  await addAssetToToken(gun, 3, 6, 0);

  console.log(11);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});