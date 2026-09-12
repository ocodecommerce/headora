import { useEffect } from "react"
import type React from "react"

import styles from "../../styles/SubmmitingModal.module.css"

interface SuccessModalProps {
  message: string
  onClose: () => void
  autoCloseTime?: number
}

const SuccessModal: React.FC<SuccessModalProps> = ({ message, onClose}) => {
  

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <div className={styles.modalBody}>
          <div className={styles.successIcon}>✓</div>
          <h5>{message}</h5>
          
        </div>
      </div>
    </div>
  )
}

export default SuccessModal