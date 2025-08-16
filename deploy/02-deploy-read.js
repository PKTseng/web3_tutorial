const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy } = deployments;

  const readWriteTransfer = await deploy("ReadWriteTransfer", {
    from: firstAccount,
    logs: true,
  });

  if (network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    await new Promise((resolve) => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: readWriteTransfer.address,
      });
    } catch (error) {
      console.log(error);
    }
  }
};

module.exports.tags = ["read"];
