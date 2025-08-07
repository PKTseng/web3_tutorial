const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("test fundme contract", async function () {
  it("test if owner is msg.sender", async function () {
    const [firstAccount] = await ethers.getSigners();

    // 獲取名為 "fundMe" 的智能合約工廠，用於部署合約實例
    const fundMeFactory = await ethers.getContractFactory("FundMe");

    // 使用工廠部署合約，傳入 300 作為建構函數參數
    const fundMe = await fundMeFactory.deploy(300, "0x694AA1769357215DE4FAC081bf1f309aDC325306");

    // 等待合約部署完成並確認在區塊鏈上（注意：原代碼有錯字，應為 waitForDeployment）
    await fundMe.waitForDeployment();

    // 注意：fundMe.owner() 是 address string
    // firstAccount 是 Signer，所以要轉成 address 來比
    expect(await fundMe.owner()).to.equal(await firstAccount.getAddress());
  });
});
