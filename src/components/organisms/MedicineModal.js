import { useContext } from 'react'
import { ModalContext } from '../providers/MedicineModalProvider'
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
  const { modal, isModalOpen, setIsModalOpen } = useContext(ModalContext)

  function handleCloseModal () {
    setIsModalOpen(false)
  }

  if (!modal) {
    return <></>
  }

  return (
    <Modal
      open={isModalOpen}
      onClose={handleCloseModal}
      className={classes.modal}
      aria-labelledby="modal-title"
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500
      }}
    >
      <Fade in={isModalOpen}>
        <div>
          <MedicineModalContent item={modal} onClick={handleCloseModal}/>
        </div>
      </Fade>
    </Modal>
  )
}
