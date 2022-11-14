import { useContext } from 'react'
import NavBar from '../molecules/NavBar'
import MedicineModal from '../organisms/MedicineModal'
import MedicineModalProvider from '../providers/MedicineModalProvider'

export default function BaseLayout ({ children }) {
  return (
    <>
      <MedicineModalProvider>
        <NavBar/>
        {children}
        <MedicineModal/>
      </MedicineModalProvider>
    </>
  )
}
