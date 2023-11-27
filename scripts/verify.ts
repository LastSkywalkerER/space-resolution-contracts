import { run } from "hardhat";

const delay = async (milliseconds: number) => await new Promise((resolve) => setTimeout(resolve, milliseconds));

export const verify = async (address: string, args: any, contract?: string) => {
    console.log(`Waiting before verify contract ${address}`);
    await delay(15000);

    console.log(`Verifying contract ${address}`);
    try {
        await run("verify:verify", {
            address,
            constructorArguments: args,
            contract,
        });
    } catch (error: any) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already verified");
        } else {
            console.error(error);
        }
    }
};
