const { ethers } = require("hardhat");

const main = async () => {
  try {
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

    // 1. 初始化帳戶
    const [firstAccount, secondAccount] = await ethers.getSigners();

    // 2. 第一次投資（使用預設帳戶）
    const fundTx = await fundMe.fund({ value: ethers.parseEther("0.5") });
    await fundTx.wait();

    // 3. 檢查合約餘額
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
    console.log("第一次投資後合約餘額：" + balanceOfContract);

    // 4. 第二次投資（指定第二個帳戶）
    // const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("1") });
    // await fundTxWithSecondAccount.wait();

    // 5. 再次檢查合約餘額
    // const balanceOfContractWithSecondAccount = await ethers.provider.getBalance(fundMe.target);
    // console.log("第二次投資後合約餘額：" + balanceOfContractWithSecondAccount);

    // 6. 檢查個別投資記錄
    // const firstAccountBalanceInFundMe = await fundMe.foundersToAmount(firstAccount.address);
    // const secondAccountBalanceInFundMe = await fundMe.foundersToAmount(secondAccount.address);

    console.log(`第一個帳戶投資金額：firstAccount is ${firstAccountBalanceInFundMe}`);
    // console.log(`第二個帳戶投資金額：${secondAccountBalanceInFundMe}`);
  } catch (error) {
    console.error(error);
  }
};

main();
