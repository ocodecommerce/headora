import { useState } from "react";
import AuthenticityPromiseDescription from "./AuthenticityPromiseDescription";
import ReturnsBlock from "./ReturnsBlock";
import ShortDescription from "./ShortDescription";
import ProductItemDetails from "./ProductDetails";
import styles from "../../styles/ProductDetail.module.css";
import Image from "next/image";

function ShortDescriptionNavBars({ currentVariant, configurableOptions, Data, aggregations, ReturnDataCMSBlock, ReturnPolicy }: any) {
  console.log("aggregations in ShortDescriptionNavBars:", aggregations);
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


  return (
    <>
      {/* <ul className={styles.ShortDescriptionNavList}>
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
          Item Details
        </li>


      </ul> */}

          <div
              key={activeTab}
              className={styles.ShortDescriptionTabContent}
            >

                <ShortDescription
                  currentVariant={currentVariant}
                  configurableOptions={configurableOptions}
                  aggregations={
                    aggregations?.length > 0
                      ? aggregations
                      : Data?.aggregations
                  }
                />
          
  
                <ProductItemDetails
                  currentVariant={currentVariant}
                  configurableOptions={configurableOptions}
                  aggregations={
                    aggregations?.length > 0
                      ? aggregations
                      : Data?.aggregations
                  }
                />
            

            </div>
      
    </>
  );
}

export default ShortDescriptionNavBars;
