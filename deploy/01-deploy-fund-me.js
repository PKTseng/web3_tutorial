const { network } = require("hardhat");
const { DEVELOPMENT_CHAINS, NETWORK_CONFIG, LOCK_TIME } = require("../helper-hardhat.config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log, get } = deployments;

  log("----------------------------------------------------");
  log("正在部署 FundMe 合約...");
  log("部署帳戶:", firstAccount);
  // log("network", network); // 查看 network 詳細資訊

  let dataFeedAddr;
  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    const mockV3Aggregator = await get("MockV3Aggregator");
    dataFeedAddr = mockV3Aggregator.address;
  } else {
    dataFeedAddr = NETWORK_CONFIG[network.config.chainId].ethUsdDatafeed;
  }

  log("mockDataFeed 地址 :", dataFeedAddr);

  const fundMe = await deploy("FundMe", {
    from: firstAccount,
    args: [LOCK_TIME, dataFeedAddr],
    log: true,
  });

  log(`✅ FundMe 合約部署成功！`);
  log(`📍 合約地址: ${fundMe.address}`);
  log("----------------------------------------------------");
};

module.exports.tags = ["all", "fundMe"];
