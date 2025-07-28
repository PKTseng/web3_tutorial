require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */

// url 只能放 EVM 相容鏈的 RPC 端點，例如：
// Ethereum 主網或測試網（如 Sepolia、Goerli）
// Polygon、BSC、Arbitrum、Optimism 等 EVM 相容鏈
// 這些 RPC 端點通常來自 Infura、Alchemy、Chainstack 或官方節點
// 不能放 Solana、Aptos、Sui 等非 EVM 鏈的 RPC。

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
