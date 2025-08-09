const { DECIMAL, INITIAL_ANSWER, DEVELOPMENT_CHAINS } = require("../helper-hardhat.config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy } = deployments;

  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    await deploy("MockV3Aggregator", {
      from: firstAccount,
      args: [DECIMAL, INITIAL_ANSWER],
      log: true,
    });
  } else {
    console.log("environment is not local, mock contract deployment is skipped");
  }
};

module.exports.tags = ["all", "mock"];
