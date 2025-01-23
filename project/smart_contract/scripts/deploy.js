const hre = require("hardhat");

async function main() {
    try {
        console.log("\n=== STARTING DEPLOYMENT OF METAHIVE TOKEN ===\n");

        // Get the contract factory
        const MetaHive = await hre.ethers.getContractFactory("MetaHive");

        // Deploy the contract
        console.log("Deploying MetaHive...");
        const metaHive = await MetaHive.deploy();
        await metaHive.waitForDeployment();

        const address = await metaHive.getAddress();
        
        // Display contract address prominently
        console.log("\n=== DEPLOYMENT SUCCESSFUL ===");
        console.log("\n📄 Contract Address:");
        console.log("====================");
        console.log(`${address}`);
        console.log("====================\n");

        // Save contract address to a file
        const fs = require("fs");
        fs.writeFileSync(
            'deployed-address.txt',
            `MetaHive Token Contract Address: ${address}\nDeployment Time: ${new Date().toISOString()}`
        );
        console.log("✅ Contract address saved to deployed-address.txt\n");

        // Verify the contract on Etherscan if not on a local network
        if (network.name !== "hardhat" && network.name !== "localhost") {
            console.log("Waiting for block confirmations...");
            await metaHive.deploymentTransaction().wait(6);
            
            console.log("Verifying contract on Etherscan...");
            await hre.run("verify:verify", {
                address: address,
                constructorArguments: [],
            });
        }

        // Get and log initial contract state
        const totalSupply = await metaHive.totalSupply();
        const rate = await metaHive.getConversionRate();
        const contractBalance = await metaHive.getContractTokenBalance();

        console.log("\n=== INITIAL CONTRACT STATE ===");
        console.log(`• Total Supply: ${hre.ethers.formatEther(totalSupply)} MHI`);
        console.log(`• Conversion Rate: ${rate} tokens per ETH`);
        console.log(`• Contract Token Balance: ${hre.ethers.formatEther(contractBalance)} MHI`);
        console.log("\n=== DEPLOYMENT COMPLETE ===\n");

    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED:");
        console.error(error);
        process.exitCode = 1;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });