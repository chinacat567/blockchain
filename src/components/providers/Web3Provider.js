import { createContext, useEffect, useState } from 'react'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import NFT from '../../../artifacts/contracts/Medicine.sol/Medicine.json'
import Market from '../../../artifacts/contracts/Marketplace.sol/Marketplace.json'
import axios from 'axios'

const contextDefaultValues = {
  account: '',
  network: 'goerli',
  balance: 0,
  connectWallet: () => {},
  marketplaceContract: null,
  nftContract: null,
  isReady: false,
  hasWeb3: false,
  isVerified: false,
  isVendor: false
}

const networkNames = {
  goerli: 'GOERLI',
  unknown: 'LOCALHOST'
}

export const Web3Context = createContext(
  contextDefaultValues
)

export default function Web3Provider ({ children }) {
  const [hasWeb3, setHasWeb3] = useState(contextDefaultValues.hasWeb3)
  const [account, setAccount] = useState(contextDefaultValues.account)
  const [network, setNetwork] = useState(contextDefaultValues.network)
  const [balance, setBalance] = useState(contextDefaultValues.balance)
  const [marketplaceContract, setMarketplaceContract] = useState(contextDefaultValues.marketplaceContract)
  const [nftContract, setNFTContract] = useState(contextDefaultValues.nftContract)
  const [isReady, setIsReady] = useState(contextDefaultValues.isReady)
  const [isVerified, setIsVerified] = useState(contextDefaultValues.isVerified)
  const [isVendor, setIsVendor] = useState(contextDefaultValues.isVendor)

  useEffect(() => {
    initializeWeb3()
  }, [])



  async function initializeWeb3WithoutSigner () {
    const alchemyProvider = new ethers.providers.AlchemyProvider(80001)
    setHasWeb3(false)
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
      setHasWeb3(true)
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
        return getAndSetAccountAndBalance(provider, changedAddress)
      }

      connection.on('accountsChanged', onAccountsChanged)
      connection.on('chainChanged', initializeWeb3)
    } catch (error) {
      await initializeWeb3WithoutSigner()
      console.log(error)
    }
  }

  async function getAndSetWeb3ContextWithSigner (provider) {
    setIsReady(false)
    const signer = provider.getSigner()
    const signerAddress = await signer.getAddress()
    await getAndSetAccountAndBalance(provider, signerAddress)
    const networkName = await getAndSetNetwork(provider)
    const success = await setupContracts(signer, networkName)
    setIsReady(success)
  }

  async function getAndSetWeb3ContextWithoutSigner (provider) {
    setIsReady(false)
    const networkName = await getAndSetNetwork(provider)
    const success = await setupContracts(provider, networkName)
    setIsReady(success)
  }

  async function getAndSetAccountAndBalance (provider, address) {
    setAccount(address)
    await validateUser(address)
    await validateVendor(address)
    const signerBalance = await provider.getBalance(address)
    const balanceInEther = ethers.utils.formatEther(signerBalance)
    setBalance(balanceInEther)
  }

  async function getAndSetNetwork (provider) {
    const { name: network } = await provider.getNetwork()
    const networkName = networkNames[network]
    setNetwork(networkName)
    return networkName
  }

  async function setupContracts (signer, networkName) {
    if (!networkName) {
      setMarketplaceContract(null)
      setNFTContract(null)
      return false
    }
    const { data } = await axios(`/api/contractAddresses?network=${networkName}`)
    const marketplaceContract = new ethers.Contract(data.marketplaceAddress, Market.abi, signer)
    setMarketplaceContract(marketplaceContract)
    const nftContract = new ethers.Contract(data.nftAddress, NFT.abi, signer)
    setNFTContract(nftContract)
    return true
  }

  async function validateUser (account) {
    const { data } = await axios(`/api/users?account=${account}`)
    setIsVerified(data.exists)
  }

  async function validateVendor (account) {
    if (account === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266') {
      setIsVendor(true)
    }
    else {
      setIsVendor(false)
    }
  }

  return (
    <Web3Context.Provider
      value={{
        account,
        marketplaceContract,
        nftContract,
        isReady,
        network,
        balance,
        initializeWeb3,
        hasWeb3,
        isVerified,
        isVendor
      }}
    >
      {children}
    </Web3Context.Provider>
  )
};
