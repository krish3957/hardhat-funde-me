const { getNamedAccounts, deployments } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts()
    await deployments.fixture("all")
    const myContract = await deployments.get("FundMe");
    const fundMe = await ethers.getContractAt(myContract.abi, myContract.address);
    console.log("Withdrawing....")
    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)
    console.log("Got it back")
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })