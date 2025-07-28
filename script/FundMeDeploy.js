const {ethers} = require("hardhat");

const main = async () => {
  const FundMeFactory = await ethers.getContractFactory("FundMe");
  const FundMe = await FundMeFactory.deploy(10);

  await FundMe.waitForDeployment();
  console.log("✅ FundMe 合約部署成功！" + (await FundMe.getAddress()));

  if (hre.network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("⏳ 等待 5 個區塊確認...");
    await FundMe.deploymentTransaction().wait(5);

    await hre.run("verify:verify", {
      address: await FundMe.getAddress(),
      constructorArguments: [10],
    });
    console.log("✅ FundMe 合約已驗證！");
  } else {
    console.log("⚠️ 未在 Sepolia 測試網或未提供 Etherscan API 金鑰，跳過合約驗證。");
  }
};

main()
  .then()
  .catch((error) => {
    console.error(error);
  });
