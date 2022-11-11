import { LinearProgress } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import InstallMetamask from '../src/components/molecules/InstallMetamask'
import NFTCardList from '../src/components/organisms/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { mapCreatedAndOwnedTokenIdsAsMarketItems, getUniqueOwnedAndCreatedTokenIds } from '../src/utils/nft'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import ConnectWalletMessage from '../src/components/molecules/ConnectWalletMessage'
import UnauthenticatedUser from "../src/components/molecules/UnauthenticatedUser";

export default function CreatorDashboard () {
  const [nfts, setNfts] = useState([])
  const { account, marketplaceContract, nftContract, isReady, hasWeb3, network, isVerified } = useContext(Web3Context)
  const [isLoading, setIsLoading] = useState(true)
  const [hasWindowEthereum, setHasWindowEthereum] = useState(false)

  useEffect(() => {
    setHasWindowEthereum(window.ethereum)
  }, [])

  useEffect(() => {
    loadNFTs()
  }, [account, isReady])

  async function loadNFTs () {
    if (!isReady || !hasWeb3) return <></>
    const myUniqueCreatedAndOwnedTokenIds = await getUniqueOwnedAndCreatedTokenIds(nftContract)
    // console.log("123" + myUniqueCreatedAndOwnedTokenIds)
    const myNfts = await Promise.all(myUniqueCreatedAndOwnedTokenIds.map(
      mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, nftContract, account)
    ))
    console.log("avc" + myNfts[1].tokenId)
    setNfts(myNfts)
    setIsLoading(false)
  }

  if (!hasWindowEthereum) return <InstallMetamask/>
  if (!hasWeb3) return <ConnectWalletMessage/>
  if (!network) return <UnsupportedChain/>
  if (!isVerified) return <UnauthenticatedUser/>
  if (isLoading) return <LinearProgress/>

  return (
    <NFTCardList nfts={nfts} setNfts={setNfts} withCreateNFT={true}/>
  )
}
