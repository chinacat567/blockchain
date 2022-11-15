import { createContext, useState } from 'react'

const contextDefaultValues = {
  modal: undefined,
  isModalOpen: false,
  setModal: () => {},
  setIsModalOpen: () => {}
}

export const ModalContext = createContext(
  contextDefaultValues
)

export default function MedicineModalProvider ({ children }) {
  const [modal, setModal] = useState(contextDefaultValues.modal)
  const [isModalOpen, setIsModalOpen] = useState(contextDefaultValues.isModalOpen)

  return (
    <ModalContext.Provider
      value={{
        modal,
        isModalOpen,
        setModal,
        setIsModalOpen
      }}
    >
      {children}
    </ModalContext.Provider>
  )
};
