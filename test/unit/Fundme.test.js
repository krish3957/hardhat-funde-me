const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

~developmentChains.includes(network.name)
    ? describe.skip :
    describe("FundMe", () => {
        let fundMe;
        let deployer;
        let mockV3Aggregator;

        const sendValue = ethers.parseEther("1")
        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);
            const myContract = await deployments.get("FundMe");

            fundMe = await ethers.getContractAt(myContract.abi, myContract.address);

            const mymockV3Aggregator = await deployments.get("MockV3Aggregator");
            mockV3Aggregator = await ethers.getContractAt(
                mymockV3Aggregator.abi,
                mymockV3Aggregator.address
            );
        });

        describe("constructor", function () {
            it("sets the aggregator addresses correctly", async () => {
                const response = await fundMe.getPriceFeed();
                console.log(`fundMe getPriceFeed: ${response}`);
                assert.equal(response, await mockV3Aggregator.getAddress())
            });
        });
        describe("fund", function () {
            // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
            // could also do assert.fail
            it("Fails if you don't send enough ETH", async () => {
                await expect(fundMe.fund()).to.be.revertedWith(
                    "Minimum sending amount is 1Ether"
                )
            })
            // we could be even more precise here by making sure exactly $50 works
            // but this is good enough for now
            it("Updates the amount funded data structure", async () => {
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.getaddressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())
            })
            it("Add funder to the array of funders", async function () {
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.getFunder(0)
                assert.equal(response, deployer)
            })
        })

        describe("witdraw", async function () {
            this.beforeEach(async function () {
                await fundMe.fund({ value: sendValue })
            })
            it("Withdraw from a single founder", async function () {
                //Arrange
                const startingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.getAddress()
                )
                const startingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                )

                //Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReciept = await transactionResponse.wait(1)
                const { gasUsed, gasPrice } = transactionReciept
                const gasCost = gasUsed * gasPrice
                const endingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.getAddress()
                )
                const endingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                )
                //Assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(BigInt(startingDeployerBalance + startingFundMeBalance), endingDeployerBalance
                    + gasCost)
            })

            it("withdraw with mulltiple accouts", async function () {
                const accounts = await ethers.getSigners()

                for (let i = 0; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(accounts[i])

                    await fundMeConnectedContract.fund({ value: sendValue })
                }

                const startingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.getAddress()
                )
                const startingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                )
                const transactionResponse = await fundMe.withdraw()
                const transactionReciept = await transactionResponse.wait(1)
                const gasUsed = transactionReciept.gasUsed;
                const gasPrice = transactionReciept.gasPrice

                const gasCost = gasUsed * gasPrice
                const endingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.getAddress()
                )
                const endingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                )
                //Assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingDeployerBalance + startingFundMeBalance, endingDeployerBalance
                    + gasCost)

                await expect(fundMe.getFunder(0)).to.be.reverted

                for (let i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getaddressToAmountFunded(accounts[i].getAddress()), 0)
                }

            })

            it("only allows attacker to withdraw", async function () {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attackerConnectedAccount = await fundMe.connect(attacker)
                await expect(attackerConnectedAccount.withdraw()).to.be.reverted
            })
        })
    });