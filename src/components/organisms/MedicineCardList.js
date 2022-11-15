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
import { mapCreatedAndOwnedTokenIdsAsMarketItems } from '../../utils/medicine'

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

  async function updateMedicine (index, tokenId) {
    const newMedicines = await mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, medicineContract, metaMaskAccount)(tokenId)
    setMedicines(prevMedicines => {
      const updatedMedicines = [...prevMedicines]
      updatedMedicines[index] = newMedicines
      return updatedMedicines
    })
  }

  async function insertMedicine (tokenId) {
    const item = await mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, medicineContract, metaMaskAccount)(tokenId)
    setMedicines(prevMedicines => [item, ...prevMedicines])
  }

  function Medicine ({ medicine, index }) {
    if (!medicine.owner) {
      return <MedicineCardCreation insertMedicine={insertMedicine}/>
    }

    if (medicine.owner === metaMaskAccount && medicine.marketItemId && !medicine.hasMarketApproval) {
      return <MedicineCard medicine={medicine} action="approve" updateMedicine={() => updateMedicine(index, medicine.tokenId)}/>
    }

    if (medicine.owner === metaMaskAccount) {
      return <MedicineCard medicine={medicine} action="sell" updateMedicine={() => updateMedicine(index, medicine.tokenId)}/>
    }

    if (medicine.seller === metaMaskAccount && !medicine.sold) {
      return <MedicineCard medicine={medicine} action="cancel" updateMedicine={() => updateMedicine(index, medicine.tokenId)} />
    }

    if (medicine.owner === ethers.constants.AddressZero) {
      return <MedicineCard medicine={medicine} action="buy" updateMedicine={() => updateMedicine(index, medicine.tokenId)} />
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
          <MedicineCardCreation insertMedicine={insertMedicine}/>
        </Grid>}
        {medicines.map((medicine, i) =>
          <Fade in={true} key={i}>
            <Grid item xs={12} sm={6} md={3} className={classes.gridItem} >
                <Medicine medicine={medicine} index={i} />
            </Grid>
          </Fade>
        )}
      </Grid>
    </InfiniteScroll>
  )
}
