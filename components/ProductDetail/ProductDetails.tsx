import React from "react";
import styles from "../../styles/ProductDetail.module.css";

function ItemDetails({
  currentVariant,
  configurableOptions,
  aggregations,
}: any) {
  const formatLabel = (key: string) => key.replaceAll("_", " ");

  const isConfigurable = (code: string) =>
    configurableOptions?.some((el: any) => el.attribute_code === code);

  const hasAttributes =
    currentVariant?.attributes?.some(
      (attr: any) => !isConfigurable(attr.code)
    );

  const filteredAggregations = aggregations?.filter(
    (a: any) =>
      a.attribute_code !== "price" &&
      a.attribute_code !== "category_id" &&
      a.options?.some((o: any) => o.label !== "0")
  );

  return (
    <div className={styles.productDetailNewDescriptionContainer}>
       <h3 className={styles.sectionHeading}>Specifications</h3>
      {/* ATTRIBUTES */}
      {hasAttributes && (
        <div className={styles.productAttributes}>
          <h3 className={styles.sectionHeading}>Product Details</h3>

          {currentVariant.attributes.map((attr: any) => {
            if (isConfigurable(attr.code)) return null;

            return (
              <p key={attr.code}>
                <b>{formatLabel(attr.code)}:</b> {attr.label}
              </p>
            );
          })}
        </div>
      )}

      {/* AGGREGATIONS */}
      {filteredAggregations?.length > 0 && (
        <div className={styles.productAttributes}>
         

          {filteredAggregations.map((agg: any) => {
            const validOptions = agg.options?.filter(
              (o: any) => o.label !== "0"
            );

            return (
              <p
                key={agg.attribute_code}
                className={styles.ShortDescriptionProductAttributes}
              >
                <b style={{ textTransform: "uppercase", color: "#6f6f6f" }}>
                  {agg.label.replaceAll("_", " ")}:
                </b>
                {validOptions.map((o: any, i: number) => (
                  <span key={i}> {o.label}</span>
                ))}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ItemDetails;