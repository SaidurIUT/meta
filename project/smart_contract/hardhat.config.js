require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Environment variables
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1
    },
    localhost: {
      chainId: 31337,
      blockConfirmations: 1
    },
    sepolia: {
      url: SEPOLIA_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      blockConfirmations: 6,
      gas: 2100000,
      gasPrice: 8000000000,
      verify: {
        etherscan: {
          apiKey: ETHERSCAN_API_KEY
        }
      }
    },
    goerli: {
      url: GOERLI_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 5,
      blockConfirmations: 6,
      gas: 2100000,
      gasPrice: 8000000000
    },
    mumbai: {
      url: MUMBAI_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80001,
      blockConfirmations: 6,
      gas: 2100000,
      gasPrice: 8000000000,
      verify: {
        etherscan: {
          apiKey: POLYGONSCAN_API_KEY
        }
      }
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY || "",
      goerli: ETHERSCAN_API_KEY || "",
      polygonMumbai: POLYGONSCAN_API_KEY || ""
    },
    customChains: []
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    token: "ETH"
  },
  mocha: {
    timeout: 300000 // 5 minutes
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};