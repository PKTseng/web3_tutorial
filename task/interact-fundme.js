const { task } = require("hardhat/config");

task("interact-fundMe", "測試帳戶")
  .addParam("addr", "The account's address")
  // .addParam("account", "帳戶地址") // 可以再多加 addParam
  // .addParam("addr", "合約地址")
  .setAction(async (taskArgs) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = await fundMeFactory.attach(taskArgs.addr);

    // 1. 初始化帳戶
    const [firstAccount, secondAccount] = await ethers.getSigners();

    // 2. 第一次投資（使用預設帳戶）
    const fundTx = await fundMe.fund({ value: ethers.parseEther("0.5") });
    await fundTx.wait();

    // 3. 檢查合約餘額
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
    console.log("第一次投資後合約餘額：" + balanceOfContract);

    // 4. 第二次投資（指定第二個帳戶）
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({
      value: ethers.parseEther("1"),
    });
    await fundTxWithSecondAccount.wait();

    // 5. 再次檢查合約餘額
    const balanceOfContractWithSecondAccount = await ethers.provider.getBalance(fundMe.target);
    console.log("第二次投資後合約餘額：" + balanceOfContractWithSecondAccount);

    // 6. 檢查個別投資記錄
    const firstAccountBalanceInFundMe = await fundMe.foundersToAmount(firstAccount.address);
    const secondAccountBalanceInFundMe = await fundMe.foundersToAmount(secondAccount.address);

    console.log(`第一個帳戶投資金額：firstAccount is ${firstAccountBalanceInFundMe}`);
    console.log(`第二個帳戶投資金額：${secondAccountBalanceInFundMe}`);
  });

module.exports = {};
