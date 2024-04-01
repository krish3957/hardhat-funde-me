const { ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip :
    describe("FundMe", async function () {
        let fundMe;
        let deployer;
        const sendValue = ethers.parseEther("0.01");
        this.beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);
            const myContract = await deployments.get("FundMe");

            fundMe = await ethers.getContractAt(myContract.abi, myContract.address);
        })

        it("allows people to fund and withdraw", async function () {
            await fundMe.fund({ value: sendValue })
            await fundMe.withdraw()
            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.getAddress()
            )
            assert.equal(endingFundMeBalance.toString(), "0")
        })

    })