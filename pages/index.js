import { useContext, useEffect, useState } from 'react'
import MedicineCardList from '../src/components/organisms/MedicineCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { LinearProgress } from '@mui/material'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import { mapAvailableMarketItems } from '../src/utils/nft'
import UnauthenticatedUser from '../src/components/molecules/UnauthenticatedUser'

export default function Home () {
  const { marketplaceContract, medicineContract, readyFlag, blockchain, verifiedFlag } = useContext(Web3Context)
  const [medicines, setMedicines] = useState([])
  const [loadingMedicines, setLoadingMedicines] = useState(true)
  useEffect(() => {
    loadMedicines()
  }, [readyFlag])
  async function loadMedicines () {
    if (!readyFlag) return
    const data = await marketplaceContract.fetchAvailableMarketItems()
    const items = await Promise.all(data.map(mapAvailableMarketItems(medicineContract)))
    setMedicines(items)
    setLoadingMedicines(false)
  }

  if (!blockchain) return <UnsupportedChain/>
  if (!verifiedFlag) return <UnauthenticatedUser/>
  if (loadingMedicines) return <LinearProgress/>
  if (!loadingMedicines && !medicines.length) return <h1>No Medicines For Sale</h1>
  return (
    <MedicineCardList medicines={medicines} setMedicines={setMedicines} createMedicine={false}/>
  )
}
