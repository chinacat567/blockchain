
import { ethers } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import { Card, CardActions, CardContent, CardMedia, Button, Divider, Box, CircularProgress } from '@mui/material'
import { NFTModalContext } from '../providers/MedicineModalProvider'
import { Web3Context } from '../providers/Web3Provider'
import MedicineDescription from '../atoms/MedicineDescription'
import MedicinePrice from '../atoms/MedicinePrice'
import MedicineName from '../atoms/MedicineName'
import CardAddresses from './CardAddresses'
import PriceTextField from '../atoms/PriceTextField'

const useStyles = makeStyles({
  root: {
    flexDirection: 'column',
    display: 'flex',
    margin: '15px',
    flexGrow: 1,
    maxWidth: 345
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    cursor: 'pointer'
  },
  cardContent: {
    paddingBottom: '8px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  firstDivider: {
    margin: 'auto 0 10px'
  },
  lastDivider: {
    marginTop: '10px'
  },
  addressesAndPrice: {
    display: 'flex',
    flexDirection: 'row'
  },
  addessesContainer: {
    margin: 'auto',
    width: '60%'
  },
  priceContainer: {
    width: '40%',
    margin: 'auto'
  },
  cardActions: {
    marginTop: 'auto',
    padding: '0 16px 8px 16px'
  }
})



export default function MedicineCard ({ medicine, action, updateMedicine }) {
  const { setModalNFT, setIsModalOpen } = useContext(NFTModalContext)
  const { medicineContract, marketplaceContract, web3Flag } = useContext(Web3Context)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [listingFee, setListingFee] = useState('')
  const [priceError, setPriceError] = useState(false)
  const [newPrice, setPrice] = useState(0)
  const classes = useStyles()
  const { name, description, image } = medicine

  useEffect(() => {
  }, [])

  const actions = {
    buy: {
      text: 'buy',
      method: buyMedicine
    },
    cancel: {
      text: 'cancel',
      method: cancelMedicine
    },
    approve: {
      text: 'Approve for selling',
      method: approveMedicine
    },
    sell: {
      text: 'Sell',
      method: sellMedicine
    },
    none: {
      text: '',
      method: () => {}
    }
  }

  async function buyMedicine (medicine) {
    const price = ethers.utils.parseUnits(medicine.price.toString(), 'ether')
    const transaction = await marketplaceContract.createMarketSale(medicineContract.address, medicine.marketItemId, {
      value: price
    })
    await transaction.wait()
    updateMedicine()
  }

  async function cancelMedicine (medicine) {
    const transaction = await marketplaceContract.cancelMarketItem(medicineContract.address, medicine.marketItemId)
    await transaction.wait()
    updateMedicine()
  }

  async function approveMedicine (medicine) {
    const approveTx = await medicineContract.approve(marketplaceContract.address, medicine.tokenId)
    await approveTx.wait()
    updateMedicine()
    return approveTx
  }
  function web3StringToBytes32 (text) {
    let result = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(text))
    while (result.length < 66) { result += '0' }
    if (result.length !== 66) { throw new Error('invalid web3 implicit bytes32') }
    return result
  }

  async function sellMedicine (medicine) {
    if (!newPrice) {
      setPriceError(true)
      return
    }
    setPriceError(false)
    const listingFee = await marketplaceContract.getListingFee()
    const priceInWei = ethers.utils.parseUnits(newPrice, 'ether')
    const transaction = await marketplaceContract.createMarketItem(medicineContract.address, medicine.tokenId, priceInWei, web3StringToBytes32(medicine.code), { value: listingFee.toString() })
    await transaction.wait()
    updateMedicine()
    return transaction
  }

  function handleCardImageClick () {
    setModalNFT(medicine)
    setIsModalOpen(true)
  }

  async function onClick (medicine) {
    try {
      setIsLoading(true)
      await actions[action].method(medicine)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className={classes.root}
      raised={isHovered}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      >
      <CardMedia
        className={classes.media}
        alt={name}
        image={image}
        component="a" onClick={handleCardImageClick}
      />

      <CardContent className={classes.cardContent} >
        <MedicineName name={name}/>
        <MedicineDescription description={description} />
        <Divider className={classes.firstDivider} />
        <Box className={classes.addressesAndPrice}>
          <div className={classes.addessesContainer}>
            <CardAddresses medicine={medicine} />
          </div>
          <div className={classes.priceContainer}>
            {action === 'sell'
              ? <PriceTextField listingFee={listingFee} error={priceError} disabled={isLoading} onChange={e => setPrice(e.target.value)}/>
              : <MedicinePrice medicine={medicine}/>
            }
          </div>
        </Box>
        <Divider className={classes.lastDivider} />
      </CardContent>
      <CardActions className={classes.cardActions}>
        <Button size="small" onClick={() => !isLoading && onClick(medicine)}>
          {isLoading
            ? <CircularProgress size="20px" />
            : web3Flag && actions[action].text
          }
        </Button>
      </CardActions>
    </Card>
  )
}
