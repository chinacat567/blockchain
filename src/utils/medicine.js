import axios from 'axios'
import { ethers } from 'ethers'

export async function getTokenMetadataByTokenId (medicineContract, tokenId) {
  try {
    const tokenUri = await medicineContract.tokenURI(tokenId)
    const { data: metadata } = await axios.get(tokenUri)
    return metadata
  } catch (error) {
    console.log(error)
  }
}

export function mapAvailableMarketItems (medicineContract) {
  return async (marketItem) => {
    const metadata = await getTokenMetadataByTokenId(medicineContract, marketItem.tokenId)
    return {
      price: marketItem.price ? ethers.utils.formatUnits(marketItem.price, 'ether') : undefined,
      tokenId: marketItem.tokenId,
      marketItemId: marketItem.marketItemId || undefined,
      creator: marketItem.creator,
      seller: marketItem.seller || undefined,
      owner: marketItem.owner,
      sold: marketItem.sold || false,
      canceled: marketItem.canceled || false,
      image: metadata.image,
      name: metadata.name,
      description: metadata.description,
      code: metadata.code,
      hasMarketApproval: false
    }
  }
}

export function mapCreatedAndOwnedTokenIdsAsMarketItems (marketplaceContract, medicineContract, account) {
  return async (tokenId) => {
    const metadata = await getTokenMetadataByTokenId(medicineContract, tokenId)
    const approveAddress = await medicineContract.getApproved(tokenId)
    const hasMarketApproval = approveAddress === marketplaceContract.address
    const [foundMarketItem, hasFound] = await marketplaceContract.getItem(tokenId)
    const item = hasFound ? foundMarketItem : {}
    return {
      price: item.price ? ethers.utils.formatUnits(item.price, 'ether') : undefined,
      tokenId: item.tokenId || tokenId,
      marketItemId: item.marketItemId || undefined,
      creator: item.creator || account,
      seller: item.seller || undefined,
      owner: item.owner || account,
      sold: item.sold || false,
      canceled: item.canceled || false,
      image: metadata.image,
      name: metadata.name,
      description: metadata.description,
      code: metadata.code,
      hasMarketApproval: hasMarketApproval || false
    }
  }
}

// export function mapMarketItem (marketItem, metadata, tokenId, account, hasMarketApproval) {
//   return {
//     price: marketItem.price ? ethers.utils.formatUnits(marketItem.price, 'ether') : undefined,
//     tokenId: marketItem.tokenId || tokenId,
//     marketItemId: marketItem.marketItemId || undefined,
//     creator: marketItem.creator || account,
//     seller: marketItem.seller || undefined,
//     owner: marketItem.owner || account,
//     sold: marketItem.sold || false,
//     canceled: marketItem.canceled || false,
//     image: metadata.image,
//     name: metadata.name,
//     description: metadata.description,
//     code: metadata.code,
//     hasMarketApproval: hasMarketApproval || false
//   }
// }

export async function getAllTokenIds (medicineContract) {
  const tokenIdsForCreator = await medicineContract.getMedicinesCreatedBySender()
  const tokenIdsForOwner = await medicineContract.getMedicinesOwnedByMe()
  const myTokens = [...tokenIdsForCreator, ...tokenIdsForOwner]
  return [...new Map(myTokens.map((item) => [item._hex, item])).values()]
}
