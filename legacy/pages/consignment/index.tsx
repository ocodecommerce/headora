
import type React from "react";

import { useState } from "react";
import styles from "../../styles/Consignment.module.css";
import StepOne from "@/components/consignment/StepOne";
import StepTwo from "@/components/consignment/StepTwo";
import SuccessModal from "@/components/Modals/SuccessModal";
import Head from "next/head";

function Consignment() {
  // State for items and current step
  const [items, setItems] = useState<
    { type: string; brand: string; value: string }[]
  >([]);
  const [currentStep, setCurrentStep] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [showModal, setShowModal] = useState(false);

  const addItem = (type: string, brand: string, value: string) => {
    if (type && value) {
      setItems([...items, { type, brand, value }]);

      setCurrentStep(2);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);

    setItems([]);
    setName("");
    setEmail("");
    setPhone("");
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitStatus(null);
    setIsSubmitting(true);

    try {
      for (const item of items) {
        const apiPayload = {
          itemType: item.type,
          brandName: item.brand || "Not specified",
          price: Number.parseFloat(item.value),
          name: name,
          email: email,
          phoneNumber: phone,
        };

        const response = await fetch(
          `${process.env.baseURL}rest/V1/consignment/submit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiPayload),
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
      }

      setSubmitStatus({
        success: true,
        message: "Your consignment has been submitted successfully!",
      });
      // Show modal
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        setCurrentStep(1);
      }, 7000);
    } catch (error) {
      console.error("Error submitting consignment:", error);
      setSubmitStatus({
        success: false,
        message:
          "There was an error submitting your consignment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Consignment Form | Headora</title>
        <meta name="description" content="Consignment Form | Headora" />
        <meta name="keywords" content="Consignment Form | Headora"></meta>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${process.env.baseURL}consignment/`} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Consignment Form | Headora" />
        <meta
          property="og:description"
          content="Consignment Form | Headora"
        />
        <meta
          property="og:url"
          content={`${process.env.baseURL}consignment/`}
        />
        <meta property="og:site_name" content="Headora" />
        <meta
          property="og:image"
          content={`${process.env.baseURL}/Images/sellOGImage.png`}
        />
        <meta
          property="og:image:secure_url"
          content={`${process.env.baseURL}/Images/sellOGImage.png`}
        />
        <meta property="og:image:width" content="1032" />
        <meta property="og:image:height" content="535" />
        <meta property="og:image:alt" content="Consignment Form | Headora" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Consignment Form | Headora" />
        <meta
          name="twitter:description"
          content="Consignment Form | Headora"
        />
        <meta
          name="twitter:image"
          content={`${process.env.baseURL}/Images/consignmentOGImage.png`}
        />
        <meta name="twitter:label1" content="Time to read" />
        <meta name="twitter:data1" content="1 minute" />
      </Head>

      {/* Success Modal */}
      {showModal && (
        <SuccessModal
          message="Your consignment has been submitted successfully!"
          onClose={handleCloseModal}
        />
      )}

      {/* Status message for errors only */}
      {submitStatus && !submitStatus.success && (
        <div className={`${styles.statusMessage} ${styles.error}`}>
          {submitStatus.message}
        </div>
      )}

      {/* Always show Step 1 */}
      {currentStep === 1 && <StepOne onAddItem={addItem} />}

      {/* Show Step 2 only after an item has been added */}
      {currentStep === 2 && (
        <StepTwo
          items={items}
          setItems={setItems}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          onSubmit={handleSubmit}
          setCurrentStep={setCurrentStep}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}

export default Consignment;
