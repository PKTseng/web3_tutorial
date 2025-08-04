const { task } = require("hardhat/config");

task("deploy-fundMe", "部署跟驗證說明").setAction(async (taskArgs) => {
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  const fundMe = await fundMeFactory.deploy(300);

  await fundMe.waitForDeployment();
  console.log("✅ fundMe 合約部署成功！" + (await fundMe.getAddress()));

  if (hre.network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("⏳ 等待 5 個區塊確認...");
    await fundMe.deploymentTransaction().wait(5);

    await hre.run("verify:verify", {
      address: await fundMe.getAddress(),
      constructorArguments: [300],
    });
    console.log("✅ fundMe 合約已驗證！");
  } else {
    console.log("⚠️ 未在 Sepolia 測試網或未提供 Etherscan API 金鑰，跳過合約驗證。");
  }
});

module.exports = {};
