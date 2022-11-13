const path = require('path')
require('@nomiclabs/hardhat-waffle')
require('dotenv').config({ path: path.join(__dirname, '/.env.local') })
require('hardhat-gas-reporter')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY, process.env.ACCOUNT2_PRIVATE_KEY],
      gas: 5500000,
      gasPrice: 7000000000
    }
  },
  solidity: {
    version: '0.6.2',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
