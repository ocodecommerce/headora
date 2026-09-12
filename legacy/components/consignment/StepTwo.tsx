"use client"
import styles from "../../styles/Consignment.module.css"
import ItemList from "./ItemList"
import Link from "next/link"

const StepTwo = ({
  items,
  setItems,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  onSubmit,
  setCurrentStep,
  isSubmitting,
}:any) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>CONSIGNMENT STEP 2 OF 2</h2>
      <p className={styles.subheading}>Please fill out your contact and shipping details.</p>

      <form onSubmit={onSubmit}>
        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>

        <ItemList items={items} setItems={setItems} setCurrentStep={setCurrentStep} />
        <p className={styles.checkboxContainer}>
          <input type="checkbox" id="chkLine" value="I agree to the Consignment Agreement" required />
          <label>
            {" "}
            I agree to the{" "}
            <Link href="/consignment-terms/" target="_blank" title="I agree to the consignment agreement">
              Consignment Agreement
            </Link>
          </label>
        </p>
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.nextBtn} disabled={isSubmitting}>
            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
          </button>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => {
              setCurrentStep(1)
            }}
            disabled={isSubmitting}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  )
}

export default StepTwo
