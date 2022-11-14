import { createContext, useEffect, useState } from 'react'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import Medicine from '../../../artifacts/contracts/Medicine.sol/Medicine.json'
import Market from '../../../artifacts/contracts/Marketplace.sol/Marketplace.json'
import axios from 'axios'

const defaultValues = {
  blockchain: 'goerli',
  metaMaskAccount: '',
  walletBalance: 0,
  marketplaceContract: null,
  medicineContract: null,
  web3Flag: false,
  readyFlag: false,
  verifiedFlag: false,
  vendorFlag: false,
  connectWallet: () => {}
}

const networks = {
  goerli: 'GOERLI',
  unknown: 'LOCALHOST'
}

export const Web3Context = createContext(defaultValues)

export default function Web3Provider ({ children }) {
  const [blockchain, setBlockchain] = useState(defaultValues.blockchain)
  const [metaMaskAccount, setMetaMaskAccount] = useState(defaultValues.metaMaskAccount)
  const [walletBalance, setWalletBalance] = useState(defaultValues.walletBalance)
  const [marketplaceContract, setMarketplaceContract] = useState(defaultValues.marketplaceContract)
  const [medicineContract, setMedicineContract] = useState(defaultValues.medicineContract)
  const [web3Flag, setWeb3Flag] = useState(defaultValues.web3Flag)
  const [readyFlag, setReadyFlag] = useState(defaultValues.readyFlag)
  const [verifiedFlag, setVerifiedFlag] = useState(defaultValues.verifiedFlag)
  const [vendorFlag, setVendorFlag] = useState(defaultValues.vendorFlag)

  useEffect(() => {
    initializeWeb3()
  }, [])



  async function initializeWeb3WithoutSigner () {
    const alchemyProvider = new ethers.providers.AlchemyProvider(80001)
    setWeb3Flag(false)
    await getAndSetWeb3ContextWithoutSigner(alchemyProvider)
  }

  async function initializeWeb3 () {
    try {
      if (!window.ethereum) {
        await initializeWeb3WithoutSigner()
        return
      }

      let onAccountsChangedCooldown = false
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      setWeb3Flag(true)
      const provider = new ethers.providers.Web3Provider(connection, 'any')
      await getAndSetWeb3ContextWithSigner(provider)

      async function onAccountsChanged (accounts) {
        // Workaround to accountsChanged metamask mobile bug
        if (onAccountsChangedCooldown) return
        onAccountsChangedCooldown = true
        setTimeout(() => { onAccountsChangedCooldown = false }, 1000)
        const changedAddress = ethers.utils.getAddress(accounts[0])
        await validateUser(changedAddress)
        await validateVendor(changedAddress)
        return getAndsetMetaMaskAccountAndBalance(provider, changedAddress)
      }

      connection.on('accountsChanged', onAccountsChanged)
      connection.on('chainChanged', initializeWeb3)
    } catch (error) {
      await initializeWeb3WithoutSigner()
      console.log(error)
    }
  }

  async function getAndSetWeb3ContextWithSigner (provider) {
    setReadyFlag(false)
    const signer = provider.getSigner()
    const signerAddress = await signer.getAddress()
    await getAndsetMetaMaskAccountAndBalance(provider, signerAddress)
    const networkName = await getAndSetNetwork(provider)
    const success = await setupContracts(signer, networkName)
    setReadyFlag(success)
  }

  async function getAndSetWeb3ContextWithoutSigner (provider) {
    setReadyFlag(false)
    const networkName = await getAndSetNetwork(provider)
    const success = await setupContracts(provider, networkName)
    setReadyFlag(success)
  }

  async function getAndsetMetaMaskAccountAndBalance (provider, address) {
    setMetaMaskAccount(address)
    await validateUser(address)
    await validateVendor(address)
    const signerBalance = await provider.getBalance(address)
    const balanceInEther = ethers.utils.formatEther(signerBalance)
    setWalletBalance(balanceInEther)
  }

  async function getAndSetNetwork (provider) {
    const { name: network } = await provider.getNetwork()
    const networkName = networks[network]
    setBlockchain(networkName)
    return networkName
  }

  async function setupContracts (signer, networkName) {
    if (!networkName) {
      setMarketplaceContract(null)
      setMedicineContract(null)
      return false
    }
    const { data } = await axios(`/api/contractAddresses?network=${networkName}`)
    const marketplaceContract = new ethers.Contract(data.marketplaceAddress, Market.abi, signer)
    setMarketplaceContract(marketplaceContract)
    const nftContract = new ethers.Contract(data.nftAddress, Medicine.abi, signer)
    setMedicineContract(nftContract)
    return true
  }

  async function validateUser (account) {
    const { data } = await axios(`/api/users?account=${account}`)
    setVerifiedFlag(data.exists)
  }

  async function validateVendor (account) {
    if (account === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266') {
      setVendorFlag(true)
    }
    else {
      setVendorFlag(false)
    }
  }

  return (
      <Web3Context.Provider
          value={{
            blockchain,
            metaMaskAccount,
            walletBalance,
            marketplaceContract,
            medicineContract,
            web3Flag,
            readyFlag,
            verifiedFlag,
            vendorFlag,
            initializeWeb3
          }}
      >
        {children}
      </Web3Context.Provider>
  )
};
