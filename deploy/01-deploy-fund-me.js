const { network } = require("hardhat");
const { DEVELOPMENT_CHAINS, NETWORK_CONFIG, LOCK_TIME } = require("../helper-hardhat.config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log, get } = deployments;

  log("----------------------------------------------------");
  log("正在部署 FundMe 合約...");
  log("部署帳戶:", firstAccount);

  // 1) 依網路取得 dataFeed
  const dataFeedAddr = DEVELOPMENT_CHAINS.includes(network.name)
    ? (await get("MockV3Aggregator")).address
    : NETWORK_CONFIG[network.config.chainId].ethUsdDatafeed;

  // 2) 讀取全域 blockConfirmations（fallback 5）
  const waitBlockConfirmations = network.config.blockConfirmations || 5;

  // 3) 部署時就等確認數
  const fundMe = await deploy("FundMe", {
    from: firstAccount,
    args: [LOCK_TIME, dataFeedAddr],
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  // 4) sepolia 才驗證；驗證前額外等 5 秒，避免索引延遲
  if (network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    log("等待 5 秒再驗證（Etherscan 索引緩衝）...");
    await new Promise((r) => setTimeout(r, 5000));

    await hre.run("verify:verify", {
      address: fundMe.address,
      constructorArguments: [LOCK_TIME, dataFeedAddr],
    });
    log("✅ Verified on Etherscan");
  } else {
    log("Network is not sepolia, verification skipped...");
  }

  log(`✅ FundMe 合約部署成功！`);
  log(`📍 合約地址: ${fundMe.address}`);
  log("----------------------------------------------------");
};

module.exports.tags = ["all", "fundMe"];
