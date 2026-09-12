// components/MakeAOffer.tsx
import React, { useState } from "react";
import styles from "../../styles/MakeAOffer.module.css";
import { useRouter } from "next/router";
import SuccessModal from "./SuccessModal";
import { useAuth } from "@/context/auth-context";

const MakeAOffer = ({
  sku,
  productName,
  price,
  specialPrice,
  productID,
}: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    your_name: "",
    your_email: "",
    product_sku: sku,
    product_name: productName,
    product_price: price.replace(/^\$/, ""),
    special_price: specialPrice.replace(/^\$/, ""),
    your_price: "",
    your_message: "",
    product_id: productID,
    customer_id: "",
  });
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { setIsLoggedIn } = useAuth();
  const handleCloseModal = () => {
    setShowModal(false);
    setIsOpen(false);
  };

  const handleMakeOfferClick = async () => {
    try {

      const storedUserSyncData = sessionStorage.getItem("userSyncData");
      let userData = storedUserSyncData ? JSON.parse(storedUserSyncData) : null;


      if (!userData || !userData.logged_in) {

        if (typeof window !== "undefined" && window.location.hostname === "localhost") {
          console.log("Skipping API call on localhost due to CORS");
          return;
        }

        const response = await fetch(`${process.env.baseURL}fcprofile/sync/index`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user sync data");

        userData = await response.json();
        console.log("Sync API response:", userData);
        sessionStorage.setItem("userSyncData", JSON.stringify(userData))

      }


      if (userData.logged_in) {
        setFormData((prev) => ({
          ...prev,
          your_name: userData.customer_name || "",
          your_email: userData.customer_email || "",
          customer_id: userData.customer_id?.toString() || "",
        }));
        setIsOpen(true);
        setIsLoggedIn(true)
      } else {
        router.push("/customer/account/login/");
      }
    } catch (error) {
      console.error("Failed to sync user info:", error);
    }
  };



  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Manually construct query string (without automatic encoding)
      const queryParams = [
        `your_name=${formData.your_name}`,
        `your_email=${formData.your_email}`,
        `product_sku=${formData.product_sku}`,
        `product_name=${formData.product_name}`,
        `product_price=${formData.product_price.replace(/,/g, '')}`, // remove commas
        `special_price=${formData.special_price}`,
        `your_price=${formData.your_price}`,
        `your_message="${formData.your_message}"`,
        `product_id=${formData.product_id}`,
        `customer_id=${formData.customer_id}`,
      ].join("&");

      const url = `${process.env.baseURLWithoutTrailingSlash}/pricebargain/enquiry/index?${queryParams}`;

      const response = await fetch(url, {
        method: "GET",
      });

      if (response.status == 200 || response.ok == true) {

        setSubmitStatus({
          success: true,
          message: "Your Offer has been submitted successfully!",
        });

        setShowModal(true);
        setIsOpen(false);

        setTimeout(() => {
          setShowModal(false);
        }, 7000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus({
        success: false,
        message: "There was an error submitting your offer. Please try again later.",
      });
    }
  };


  return (
    <>
      <button onClick={handleMakeOfferClick} className={styles.offerButton}>
        Make an Offer
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <h2>Make an Offer</h2>

              <div className={styles.inputWrapper}>
                <div className={styles.inputGroup}>
                  <label>Name</label>
                  <input
                    name="your_name"
                    value={formData.your_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email</label>
                  <input
                    name="your_email"
                    value={formData.your_email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Product SKU</label>
                <input name="product_sku" value={formData.product_sku} readOnly />
              </div>

              <div className={styles.inputGroup}>
                <label>Product Name</label>
                <input name="product_name" value={formData.product_name} readOnly />
              </div>

              <div className={styles.inputWrapper}>
                <div className={styles.inputGroup}>
                  <label>Product Price</label>
                  <input
                    name="product_price"
                    value={`$${formData.product_price}`}
                    readOnly
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Special Price</label>
                  <input
                    name="special_price"
                    value={`$${formData.special_price}`}
                    readOnly
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Make An Offer</label>
                <input
                  name="your_price"
                  value={formData.your_price}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Message</label>
                <textarea
                  name="your_message"
                  value={formData.your_message}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.ButtonGroup}>
                <button type="submit" className={styles.submitButton}>
                  Submit Offer
                </button>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showModal && (
        <SuccessModal
          message="Your consignment has been submitted successfully!"
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default MakeAOffer;
