import InfiniteScroll from 'react-infinite-scroll-component'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Fade from '@mui/material/Fade'
import { makeStyles } from '@mui/styles'
import MedicineCard from '../molecules/MedicineCard'
import MedicineCardCreation from '../molecules/MedicineCardCreation'
import { ethers } from 'ethers'
import { Web3Context } from '../providers/Web3Provider'
import { useContext } from 'react'
import { mapCreatedAndOwnedTokenIdsAsMarketItems } from '../../utils/nft'

const useStyles = makeStyles((theme) => ({
  grid: {
    spacing: 3,
    alignItems: 'stretch'
  },
  gridItem: {
    display: 'flex',
    transition: 'all .3s',
    [theme.breakpoints.down('sm')]: {
      margin: '0 20px'
    }
  }
}))

export default function MedicineCardList ({ medicines, setMedicines, createMedicine }) {
  const classes = useStyles()
  const { metaMaskAccount, marketplaceContract, medicineContract } = useContext(Web3Context)

  async function updateNFT (index, tokenId) {
    const updatedNFt = await mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, medicineContract, metaMaskAccount)(tokenId)
    setMedicines(prevMedicines => {
      const updatedMedicines = [...prevMedicines]
      updatedMedicines[index] = updatedNFt
      return updatedMedicines
    })
  }

  async function addNFTToList (tokenId) {
    const item = await mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, medicineContract, metaMaskAccount)(tokenId)
    setMedicines(prevMedicines => [item, ...prevMedicines])
  }

  function NFT ({ medicine, index }) {
    if (!medicine.owner) {
      return <MedicineCardCreation addNFTToList={addNFTToList}/>
    }

    if (medicine.owner === metaMaskAccount && medicine.marketItemId && !medicine.hasMarketApproval) {
      return <MedicineCard medicine={medicine} action="approve" updateNFT={() => updateNFT(index, medicine.tokenId)}/>
    }

    if (medicine.owner === metaMaskAccount) {
      return <MedicineCard medicine={medicine} action="sell" updateNFT={() => updateNFT(index, medicine.tokenId)}/>
    }

    if (medicine.seller === metaMaskAccount && !medicine.sold) {
      return <MedicineCard medicine={medicine} action="cancel" updateNFT={() => updateNFT(index, medicine.tokenId)} />
    }

    if (medicine.owner === ethers.constants.AddressZero) {
      return <MedicineCard medicine={medicine} action="buy" updateNFT={() => updateNFT(index, medicine.tokenId)} />
    }

    return <MedicineCard medicine={medicine} action="none"/>
  }

  return (
    <InfiniteScroll
      dataLength={medicines.length}
      loader={<LinearProgress />}
    >
      <Grid container className={classes.grid} id="grid">
        {createMedicine && <Grid item xs={12} sm={6} md={3} className={classes.gridItem}>
          <MedicineCardCreation addNFTToList={addNFTToList}/>
        </Grid>}
        {medicines.map((medicine, i) =>
          <Fade in={true} key={i}>
            <Grid item xs={12} sm={6} md={3} className={classes.gridItem} >
                <NFT medicine={medicine} index={i} />
            </Grid>
          </Fade>
        )}
      </Grid>
    </InfiniteScroll>
  )
}
