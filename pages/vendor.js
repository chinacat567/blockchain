import { useContext, useEffect, useState } from 'react'
import InstallMetamask from '../src/components/molecules/InstallMetamask'
import { Web3Context } from '../src/components/providers/Web3Provider'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import ConnectWalletMessage from '../src/components/molecules/ConnectWalletMessage'
import UnauthenticatedVendor from '../src/components/molecules/UnauthenticatedVendor'
import VendorCard from '../src/components/molecules/VendorCard'

export default function VendorDashboard () {
  const { web3Flag, blockchain, vendorFlag } = useContext(Web3Context)
  const [ethereumFlag, setEthereumFlag] = useState(false)

  useEffect(() => {
    setEthereumFlag(window.ethereum)
  }, [])

  if (!ethereumFlag) return <InstallMetamask/>
  if (!web3Flag) return <ConnectWalletMessage/>
  if (!blockchain) return <UnsupportedChain/>
  if (!vendorFlag) return <UnauthenticatedVendor/>

  return (<VendorCard/>)
}
