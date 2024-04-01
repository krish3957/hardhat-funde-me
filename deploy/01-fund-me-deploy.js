const { network } = require("hardhat")

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    // const ethUSDPriceFeed = networkConfig[chainId]["ethUSDPriceFeed"]
    let ethUSDPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUSDAggregator = await get("MockV3Aggregator")
        ethUSDPriceFeedAddress = ethUSDAggregator.address
    } else {
        ethUSDPriceFeedAddress = networkConfig[chainId]["ethUSDPriceFeed"]
    }

    //if the contract doesn't exist we deploy minimal version for our local testing
    const args = [ethUSDPriceFeedAddress]
    const FundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(FundMe.address, args);
    }
}

module.exports.tags = ["all", "fundme"]
