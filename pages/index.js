import { useContext, useEffect, useState } from 'react'
import NFTCardList from '../src/components/organisms/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { LinearProgress } from '@mui/material'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import { mapAvailableMarketItems } from '../src/utils/nft'
import axios from "axios";
import {ethers} from "ethers";
import Market from "../artifacts/contracts/Marketplace.sol/Marketplace";
import Medicine from "../artifacts/contracts/Medicine.sol/MedicineToken.json";
import UnauthenticatedUser from '../src/components/molecules/UnauthenticatedUser'

export default function Home () {
  const [nfts, setNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { marketplaceContract, nftContract, isReady, network, account, isVerified } = useContext(Web3Context)

  useEffect(() => {
    loadNFTs()
  }, [isReady])
  async function loadNFTs () {
    if (!isReady) return
    const data = await marketplaceContract.fetchUnsoldMedicines()
    const items = await Promise.all(data.map(mapAvailableMarketItems(nftContract)))
    setNfts(items)
    setIsLoading(false)
  }

  if (!network) return <UnsupportedChain/>
  if (!isVerified) return <UnauthenticatedUser/>
  if (isLoading) return <LinearProgress/>
  if (!isLoading && !nfts.length) return <h1>No Items for sale</h1>
  return (
    <NFTCardList nfts={nfts} setNfts={setNfts} withCreateNFT={false}/>
  )
}
