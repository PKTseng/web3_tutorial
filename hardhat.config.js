require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
// require("@chainlink/env-enc").config();

require("./task");

/** @type import('hardhat/config').HardhatUserConfig */

// url 只能放 EVM 相容鏈的 RPC 端點，例如：
// Ethereum 主網或測試網（如 Sepolia、Goerli）
// Polygon、BSC、Arbitrum、Optimism 等 EVM 相容鏈
// 這些 RPC 端點通常來自 Infura、Alchemy、Chainstack 或官方節點
// 不能放 Solana、Aptos、Sui 等非 EVM 鏈的 RPC。

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111, // Sepolia 測試網的 Chain ID
    },
    // ganache: {
    //   url: "HTTP://127.0.0.1:7545",
    //   chainId: 1337,
    // },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
