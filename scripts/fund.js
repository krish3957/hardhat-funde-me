const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const deployer = await getNamedAccounts()
    const myContract = await deployments.get("FundMe");

    const fundMe = await ethers.getContractAt(myContract.abi, myContract.address);
    console.log('Funding Contract');
    const transactionResponse = await fundMe.fund({
        value: ethers.parseEther("0.1")
    })
    await transactionResponse.wait(1)
    console.log("Funded")
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })