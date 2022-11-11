import { LinearProgress } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import InstallMetamask from '../src/components/molecules/InstallMetamask'
import { Web3Context } from '../src/components/providers/Web3Provider'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import ConnectWalletMessage from '../src/components/molecules/ConnectWalletMessage'
import UnauthenticatedVendor from '../src/components/molecules/UnauthenticatedVendor'
import VendorCard from '../src/components/molecules/VendorCard'

export default function VendorDashboard () {
  const [nfts, setNfts] = useState([])
  const { account, marketplaceContract, nftContract, isReady, hasWeb3, network, isVerified, isVendor } = useContext(Web3Context)
  const [isLoading, setIsLoading] = useState(true)
  const [hasWindowEthereum, setHasWindowEthereum] = useState(false)

  useEffect(() => {
    setHasWindowEthereum(window.ethereum)
  }, [])

  if (!hasWindowEthereum) return <InstallMetamask/>
  if (!hasWeb3) return <ConnectWalletMessage/>
  if (!network) return <UnsupportedChain/>
  if (!isVendor) return <UnauthenticatedVendor/>

  return (
        <VendorCard/>
  )
}
