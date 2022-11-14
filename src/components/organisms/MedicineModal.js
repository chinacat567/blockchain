import { useContext } from 'react'
import { NFTModalContext } from '../providers/MedicineModalProvider'
import Fade from '@mui/material/Fade'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import { makeStyles } from '@mui/styles'
import MedicineModalContent from './MedicineModalContent'

const useStyles = makeStyles({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default function MedicineModal () {
  const classes = useStyles()
  const { modalNFT, isModalOpen, setIsModalOpen } = useContext(NFTModalContext)

  function handleCloseModal () {
    setIsModalOpen(false)
  }

  if (!modalNFT) {
    return <></>
  }

  return (
    <Modal
      open={isModalOpen}
      onClose={handleCloseModal}
      className={classes.modal}
      aria-labelledby="nft-modal-title"
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500
      }}
    >
      <Fade in={isModalOpen}>
        <div>
          <MedicineModalContent nft={modalNFT} onClick={handleCloseModal}/>
        </div>
      </Fade>
    </Modal>
  )
}
