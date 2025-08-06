const { ethers, network } = require("hardhat");

const main = async () => {
  try {
    // 打印網絡資訊以確認
    const chainId = await ethers.provider.getNetwork().then((net) => net.chainId);
    console.log(`當前網絡: ${network.name}, chainId: ${chainId}`);

    let dataFeedAddress;

    // 檢查是否為 Ganache 網絡
    if (network.name === "ganache" || chainId == 1337) {
      console.log("檢測到 Ganache 網絡，部署 MockV3Aggregator...");
      try {
        const MockV3AggregatorFactory = await ethers.getContractFactory("MockV3Aggregator");
        const decimals = 8;
        const initialAnswer = 2000 * 10 ** 8; // 1 ETH = 2000 USD
        const mock = await MockV3AggregatorFactory.deploy(decimals, initialAnswer);
        await mock.waitForDeployment();
        dataFeedAddress = await mock.getAddress();
        console.log(`✅ MockV3Aggregator 部署成功！地址: ${dataFeedAddress}`);
      } catch (mockError) {
        console.error("❌ MockV3Aggregator 部署失敗:", mockError);
        throw mockError;
      }
    } else {
      console.log("使用 Sepolia 網絡的真實 Chainlink 地址");
      dataFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
    }

    // 部署 FundMe
    console.log(`部署 FundMe 合約，使用 dataFeedAddress: ${dataFeedAddress}`);
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = await fundMeFactory.deploy(300, dataFeedAddress);
    await fundMe.waitForDeployment();
    const fundMeAddress = await fundMe.getAddress();
    console.log(`✅ FundMe 合約部署成功！地址: ${fundMeAddress}`);

    // 如果在 Sepolia 網絡，驗證合約
    if (network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
      console.log("⏳ 等待 5 個區塊確認...");
      await fundMe.deploymentTransaction().wait(5);
      await hre.run("verify:verify", {
        address: fundMeAddress,
        constructorArguments: [300, dataFeedAddress],
      });
      console.log("✅ FundMe 合約已驗證！");
    } else {
      console.log("⚠️ 非 Sepolia 網絡或無 Etherscan API 金鑰，跳過驗證");
    }

    // 初始化帳戶
    const [firstAccount, secondAccount] = await ethers.getSigners();
    console.log(`第一個帳戶: ${firstAccount.address}`);
    console.log(`第二個帳戶: ${secondAccount.address}`);

    // 第一次投資
    console.log("執行第一次投資: 10 ETH");
    const fundTx = await fundMe.fund({ value: ethers.parseEther("10") });
    await fundTx.wait();
    console.log("✅ 第一次投資完成");

    // 檢查合約餘額
    const balanceOfContract = await ethers.provider.getBalance(fundMeAddress);
    console.log(`第一次投資後合約餘額: ${ethers.formatEther(balanceOfContract)} ETH`);

    // 第二次投資
    console.log("執行第二次投資: 20 ETH (第二個帳戶)");
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({
      value: ethers.parseEther("20"),
    });
    await fundTxWithSecondAccount.wait();
    console.log("✅ 第二次投資完成");

    // 再次檢查合約餘額
    const balanceOfContractWithSecondAccount = await ethers.provider.getBalance(fundMeAddress);
    console.log(`第二次投資後合約餘額: ${ethers.formatEther(balanceOfContractWithSecondAccount)} ETH`);

    // 檢查個別投資記錄
    // 檢查個別投資記錄
    const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address);
    const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address);
    console.log(`第一個帳戶投資金額: ${ethers.formatEther(firstAccountBalanceInFundMe)} ETH`);
    console.log(`第二個帳戶投資金額: ${ethers.formatEther(secondAccountBalanceInFundMe)} ETH`);
  } catch (error) {
    console.error("❌ 執行錯誤:", error);
    throw error;
  }
};

main().catch((error) => {
  console.error("主函數錯誤:", error);
  process.exit(1);
});
