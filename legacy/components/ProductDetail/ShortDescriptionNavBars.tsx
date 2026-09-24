import { useEffect, useState } from "react";
import AuthenticityPromiseDescription from "./AuthenticityPromiseDescription";

import ShortDescription from "./ShortDescription";
import ProductItemDetails from "./ProductDetails";
import ReviewSection from '../../components/ProductDetail/ReviewSection';
import styles from "../../styles/ProductDetail.module.css";
import Image from "next/image";

function ShortDescriptionNavBars({ currentVariant, configurableOptions, Data, aggregations, ReturnDataCMSBlock, ReturnPolicy,AllReviews }: any) {
  // console.log("aggregations in ShortDescriptionNavBars:", aggregations);
  const [activeTab, setActiveTab] = useState("Description");
  const [openSection, setOpenSection] = useState("Description");

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? "" : section));
  };
  const handleTabClick = (index:any) => {
    setActiveTab(index);
  
    const tab = document.getElementById(`tab-${index}`);
  
    tab?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };


  useEffect(() => {
    const handleOpenReview = () => {
      setActiveTab("reviews");
    };
  
    window.addEventListener("openReviewForm", handleOpenReview);
  
    return () => {
      window.removeEventListener("openReviewForm", handleOpenReview);
    };
  }, []);
  

  return (
    <>
    <div className={styles.desktopData}>
      <ul className={styles.ShortDescriptionNavList} id="reviews-section" >
        <div className={styles.underline} ></div>

      <li
          className={activeTab == "Description" ? styles.ShortDescriptionActiveTab : ""}
          key={`Description`}
          id={`tab-Description`}
          onClick={() => handleTabClick("Description")}
        >
          Description
        </li>


        <li
          className={activeTab == "details" ? styles.ShortDescriptionActiveTab : ""}
          key={`details`}
          id={`tab-details`}
          onClick={() => handleTabClick("details")}
        >
          Details
        </li>

        <li
          className={activeTab == "reviews" ? styles.ShortDescriptionActiveTab : ""}
          key={`reviews`}
          id={`reviews`}
          onClick={() => handleTabClick("reviews")}
        >
          Reviews
        </li>


      </ul>

          <div
              key={activeTab}
              // className={styles.ShortDescriptionTabContent}
            >
               {activeTab === "Description" && (

                <ShortDescription
                  currentVariant={currentVariant}
                  configurableOptions={configurableOptions}
                  aggregations={
                    aggregations?.length > 0
                      ? aggregations
                      : Data?.aggregations
                  }
                />
               )}
  
  {activeTab === "details" && (
                <ProductItemDetails
                  currentVariant={currentVariant}
                  configurableOptions={configurableOptions}
                  aggregations={
                    aggregations?.length > 0
                      ? aggregations
                      : Data?.aggregations
                  }
                />)}

          {activeTab === "reviews" && (

                 <ReviewSection
                    Data={Data}
                    AllReviews={AllReviews}
                  />)}
            

            </div>
            </div>

            <div className={styles.mobileAccordion}>
  {/* Description */}
  <div className={styles.accordionItem}>
    <button
      className={styles.accordionHeader}
      onClick={() => toggleSection("Description")}
    >
      <span>Description</span>
      <span>{openSection === "Description" ?       
        
        <Image
      width={15}
      height={15}
      src={"/Images/up-arrow.png"}
      alt="Close Modal"
    />
     : 
      
      <Image
      width={15}
      height={15}
      src={"/Images/down-arrow.png"}
      alt="Close Modal"
    />}
    </span>

    </button>

    <div
      className={`${styles.accordionContent} ${
        openSection === "Description" ? styles.open : ""
      }`}
    >
      <ShortDescription
        currentVariant={currentVariant}
        configurableOptions={configurableOptions}
        aggregations={
          aggregations?.length > 0 ? aggregations : Data?.aggregations
        }
      />
    </div>
  </div>

  {/* Details */}
  <div className={styles.accordionItem}>
    <button
      className={styles.accordionHeader}
      onClick={() => toggleSection("details")}
    >
      <span>Details</span>
      <span>{openSection === "details" ?         <Image
      width={15}
      height={15}
      src={"/Images/up-arrow.png"}
      alt="Close Modal"
    />
     : 
      
      <Image
      width={15}
      height={15}
      src={"/Images/down-arrow.png"}
      alt="Close Modal"
    />}
    </span>
    </button>

    <div
      className={`${styles.accordionContent} ${
        openSection === "details" ? styles.open : ""
      }`}
    >
      <ProductItemDetails
        currentVariant={currentVariant}
        configurableOptions={configurableOptions}
        aggregations={
          aggregations?.length > 0 ? aggregations : Data?.aggregations
        }
      />
    </div>
  </div>

  {/* Reviews */}
  <div className={styles.accordionItem}>
    <button
      className={styles.accordionHeader}
      onClick={() => toggleSection("reviews")}
    >
      <span>Reviews</span>
      <span>{openSection === "reviews" ?        <Image
      width={15}
      height={15}
      src={"/Images/up-arrow.png"}
      alt="Close Modal"
    />
     : 
      
      <Image
      width={15}
      height={15}
      src={"/Images/down-arrow.png"}
      alt="Close Modal"
    />}
    </span>
    </button>

    <div
      className={`${styles.accordionContent} ${
        openSection === "reviews" ? styles.open : ""
      }`}
    >
      <ReviewSection Data={Data} AllReviews={AllReviews} />
    </div>
  </div>
</div>
      
    </>
  );
}

export default ShortDescriptionNavBars;
