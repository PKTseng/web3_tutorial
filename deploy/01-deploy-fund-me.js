// module.exports = (hre) => {
//   console.log("deploy function", hre);
// };

module.exports = async ({ getNamedAccounts, deployments }) => {
  // console.log("deployments", getNamedAccounts);
  // console.log("deployments", deployments);

  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log("正在部署 FundMe 合約...");
  log("部署帳戶:", firstAccount);

  const fundMe = await deploy("FundMe", {
    from: firstAccount,
    args: [180],
    log: true,
  });

  log(`✅ FundMe 合約部署成功！`);
  log(`📍 合約地址: ${fundMe.address}`);
  log("----------------------------------------------------");
};

module.exports.tags = ["all", "fundMe"];
