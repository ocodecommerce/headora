import { useEffect, useState } from "react";
import AuthenticityPromiseDescription from "./AuthenticityPromiseDescription";
import ReturnsBlock from "./ReturnsBlock";
import ShortDescription from "./ShortDescription";
import ProductItemDetails from "./ProductDetails";
import ReviewSection from '../../components/ProductDetail/ReviewSection';
import styles from "../../styles/ProductDetail.module.css";
import Image from "next/image";

function ShortDescriptionNavBars({ currentVariant, configurableOptions, Data, aggregations, ReturnDataCMSBlock, ReturnPolicy,AllReviews }: any) {
  // console.log("aggregations in ShortDescriptionNavBars:", aggregations);
  const [activeTab, setActiveTab] = useState("Description");

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
          id={`tab-details`}
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
      
    </>
  );
}

export default ShortDescriptionNavBars;
