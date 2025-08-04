const {ethers} = require("hardhat");

const main = async () => {
  try {
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

    // 1. 初始化帳戶
    const [firstAccount, secondAccount] = await ethers.getSigners();

    // 2. 第一次投資（使用預設帳戶）
    const fundTx = await FundMe.fund({value: ethers.parseEther("0.5")});
    await fundTx.wait();

    // 3. 檢查合約餘額
    const balanceOfContract = await ethers.provider.getBalance(FundMe.target);
    console.log("第一次投資後合約餘額：" + balanceOfContract);

    // 4. 第二次投資（指定第二個帳戶）
    const fundTxWithSecondAccount = await FundMe.connect(secondAccount).fund({
      value: ethers.parseEther("1"),
    });
    await fundTxWithSecondAccount.wait();

    // 5. 再次檢查合約餘額
    const balanceOfContractWithSecondAccount = await ethers.provider.getBalance(FundMe.target);
    console.log("第二次投資後合約餘額：" + balanceOfContractWithSecondAccount);

    // 6. 檢查個別投資記錄
    const firstAccountBalanceInFundMe = await FundMe.foundersToAmount(firstAccount.address);
    const secondAccountBalanceInFundMe = await FundMe.foundersToAmount(secondAccount.address);

    console.log(`第一個帳戶投資金額：${firstAccountBalanceInFundMe}`);
    console.log(`第二個帳戶投資金額：${secondAccountBalanceInFundMe}`);
  } catch (error) {
    console.error(error);
  }
};

main();
