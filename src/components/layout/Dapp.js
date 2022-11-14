import { useContext } from 'react'
import NavBar from '../molecules/NavBar'
import NFTModal from '../organisms/NFTModal'
import NFTModalProvider from '../providers/NFTModalProvider'

export default function BaseLayout ({ children }) {
  return (
    <>
      <NFTModalProvider>
        <NavBar/>
        {children}
        <NFTModal/>
      </NFTModalProvider>
    </>
  )
}
