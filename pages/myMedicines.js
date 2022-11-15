import { LinearProgress } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import InstallMetamask from '../src/components/molecules/InstallMetamask'
import MedicineCardList from '../src/components/organisms/MedicineCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { mapCreatedAndOwnedTokenIdsAsMarketItems, getAllTokenIds } from '../src/utils/medicine'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import ConnectWalletMessage from '../src/components/molecules/ConnectWalletMessage'
import UnauthenticatedUser from '../src/components/molecules/UnauthenticatedUser';

export default function CreatorDashboard () {
  const [medicines, setMedicines] = useState([])
  const { metaMaskAccount, marketplaceContract, medicineContract, readyFlag, web3Flag, initializeWeb3, verifiedFlag } = useContext(Web3Context)
  const [isLoading, setIsLoading] = useState(true)
  const [hasWindowEthereum, setHasWindowEthereum] = useState(false)

  useEffect(() => {
    setHasWindowEthereum(window.ethereum)
  }, [])

  useEffect(() => {
    loadMedicines()
  }, [metaMaskAccount, readyFlag])

  async function loadMedicines () {
    if (!readyFlag || !web3Flag) return <></>
    const myUniqueCreatedAndOwnedTokenIds = await getAllTokenIds(medicineContract)
    const myMedicines = await Promise.all(myUniqueCreatedAndOwnedTokenIds.map(
      mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, medicineContract, metaMaskAccount)
    ))
    setMedicines(myMedicines)
    setIsLoading(false)
  }

  if (!hasWindowEthereum) return <InstallMetamask/>
  if (!web3Flag) return <ConnectWalletMessage/>
  if (!initializeWeb3) return <UnsupportedChain/>
  if (!verifiedFlag) return <UnauthenticatedUser/>
  if (isLoading) return <LinearProgress/>

  return (
    <MedicineCardList medicines={medicines} setMedicines={setMedicines} createMedicine={true}/>
  )
}
