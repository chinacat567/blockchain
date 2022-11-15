const hre = require('hardhat')
const dotenv = require('dotenv')
const fs = require('fs')

function replaceEnvContractAddresses (marketplaceAddress, medicineContractAddress, networkName) {
  const envFileName = '.env.local'
  const envFile = fs.readFileSync(envFileName, 'utf-8')
  const env = dotenv.parse(envFile)
  env[`MARKET_CONTRACT_ADDRESS_${networkName}`] = marketplaceAddress
  env[`MEDICINE_CONTRACT_ADDRESS_${networkName}`] = medicineContractAddress
  const newEnv = Object.entries(env).reduce((env, [key, value]) => {
    return `${env}${key}=${value}\n`
  }, '')

  fs.writeFileSync(envFileName, newEnv)
}

async function main () {
  process.env.IS_RUNNING = true
  const Marketplace = await hre.ethers.getContractFactory('Marketplace')
  const marketplace = await Marketplace.deploy()
  await marketplace.deployed()
  console.log('Marketplace Contract deployed to:', marketplace.address)

  const medicine = await hre.ethers.getContractFactory('Medicine')
  const medicineContract = await medicine.deploy(marketplace.address)
  await medicineContract.deployed()
  console.log('Medicine ERC721 Contract deployed to:', medicineContract.address)

  replaceEnvContractAddresses(marketplace.address, medicineContract.address, hre.network.name.toUpperCase())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
