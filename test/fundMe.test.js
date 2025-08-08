const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { expect } = require("chai");

describe("test fundMe contract", async function () {
  let fundMe;
  let firstAccount;

  beforeEach(async function () {
    await deployments.fixture("all");

    // 獲取已部署的合約實例
    const fundMeDeployment = await deployments.get("FundMe");
    fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);

    // 獲取部署時使用的帳戶
    const accounts = await getNamedAccounts();
    firstAccount = accounts.firstAccount;
  });

  it("test if owner is msg.sender", async function () {
    await fundMe.waitForDeployment();
    expect(await fundMe.owner()).to.equal(firstAccount);
  });

  it("test if the datafeed is assigned currently", async function () {
    await fundMe.waitForDeployment();
    expect(await fundMe.dataFeed()).to.equal("0x694AA1769357215DE4FAC081bf1f309aDC325306");
  });
});
