import { LinearProgress } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import InstallMetamask from '../src/components/molecules/InstallMetamask'
import MedicineCardList from '../src/components/organisms/MedicineCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { mapCreatedAndOwnedTokenIdsAsMarketItems, getUniqueOwnedAndCreatedTokenIds } from '../src/utils/nft'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import ConnectWalletMessage from '../src/components/molecules/ConnectWalletMessage'
import UnauthenticatedUser from "../src/components/molecules/UnauthenticatedUser";

export default function CreatorDashboard () {
  const [nfts, setNfts] = useState([])
  const { metaMaskAccount, marketplaceContract, medicineContract, readyFlag, web3Flag, initializeWeb3, verifiedFlag } = useContext(Web3Context)
  const [isLoading, setIsLoading] = useState(true)
  const [hasWindowEthereum, setHasWindowEthereum] = useState(false)

  useEffect(() => {
    setHasWindowEthereum(window.ethereum)
  }, [])

  useEffect(() => {
    loadNFTs()
  }, [metaMaskAccount, readyFlag])

  async function loadNFTs () {
    if (!readyFlag || !web3Flag) return <></>
    const myUniqueCreatedAndOwnedTokenIds = await getUniqueOwnedAndCreatedTokenIds(medicineContract)
    const myNfts = await Promise.all(myUniqueCreatedAndOwnedTokenIds.map(
      mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, medicineContract, metaMaskAccount)
    ))
    setNfts(myNfts)
    setIsLoading(false)
  }

  if (!hasWindowEthereum) return <InstallMetamask/>
  if (!web3Flag) return <ConnectWalletMessage/>
  if (!initializeWeb3) return <UnsupportedChain/>
  if (!verifiedFlag) return <UnauthenticatedUser/>
  if (isLoading) return <LinearProgress/>

  return (
    <MedicineCardList nfts={nfts} setNfts={setNfts} withCreateNFT={true}/>
  )
}
