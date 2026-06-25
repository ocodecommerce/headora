import React from 'react';
import styles from '../../styles/ProductDetail.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { Currency } from '../Currency/currency';

function CrossSellProducts({ Data }: any) {
// console.log("CrossSellProducts Data:", Data);

  const level2CategoryName =
  Data?.categories?.find(
    (cat:any) => cat.level === 2 && cat.id !== 35 && cat.id !== 2563
  )?.name || "Products";

  // If no cross-sell products, don't render
  if (!Data?.crosssell_products || Data.crosssell_products.length === 0) {
    return null;
  }

  // Price helper functions (cleaned up)
  function regularPrice(item: any) {
    // console.log("regularPrice item:", item);
    const final = item?.price_range?.maximum_price?.final_price?.value;
    const regular = item?.price_range?.maximum_price?.regular_price?.value;
    const currency = item?.price?.regularPrice?.amount?.currency || 'INR';
    return regular && regular !== final 
      ? `${Currency[currency]}${regular.toLocaleString()}` 
      : '';
  }

  function finalPrice(item: any) {
    // console.log("finalPrice item:", item);
    const final = item?.price_range?.maximum_price?.final_price?.value;
    const currency = item?.price?.regularPrice?.amount?.currency || 'INR';
    return final ? `${Currency[currency]}${final.toLocaleString()}` : '';
  }

  function getconfigurablePrice(item: any) {
    const regular = item?.price_range?.maximum_price?.regular_price?.value;
    const currency = item?.price_range?.maximum_price?.regular_price?.currency || 'INR';
    return regular ? `${Currency[currency]} ${regular.toLocaleString()}` : '';
  }

  function configurableFinalPrice(item: any) {
    const final = item?.price_range?.maximum_price?.final_price?.value;
    const currency = item?.price_range?.maximum_price?.regular_price?.currency || 'INR';
    return final ? `${Currency[currency]}${final.toLocaleString()}` : '';
  }

  return (
    <div className={styles.relatedProductsContainer}>
      <h2 className={styles.title}>Cross Sell {level2CategoryName}</h2>

      <div className={styles.Updated_slider}>
        {/* Prev Button - Visible only on desktop */}
        {/* <button 
          className={styles.Updated_prevButton} 
          onClick={() => {
            const container = document.querySelector(`.${styles.Updated_productsContainer2}`);
            container?.scrollBy({ left: -340, behavior: 'smooth' });
          }}
          aria-label="Previous products"
        >
          <Image 
            src="/Images/leftGoldenArrow.png" 
            alt="Left Arrow" 
            width={10} 
            height={40} 
          />
        </button> */}

        {/* Scrollable Container - Touch friendly */}
        <div className={styles.Updated_productsContainer2}>
          <div className={styles.Updated_productsGrid}>
            {Data.crosssell_products.slice(0, 10).map((product: any) => {
              let selectedVariant = null;

              if (product?.__typename === "ConfigurableProduct") {
                const optionValueIndex = product?.configurable_options?.[0]?.values?.[0]?.value_index;
                selectedVariant = product?.variants?.find((variant: any) =>
                  variant.attributes.some((attr: any) => attr.value_index === optionValueIndex)
                );
              }

              const variantProduct = selectedVariant?.product || product;

              return (
                <div key={product.uid} className={styles.Updated_productItem}>
                  <Link href={`/${product?.url_key}.html`}>
                    <Image
                      src={
                        variantProduct?.image?.url?.includes("placeholder")
                          ? variantProduct?.media_gallery?.[0]?.url?.includes("cache")
                            ? variantProduct.media_gallery[0].url.replace(/\/cache\/.*?\//, "/")
                            : variantProduct.media_gallery?.[0]?.url
                          : variantProduct?.image?.url?.includes("cache")
                            ? variantProduct.image.url.replace(/\/cache\/.*?\//, "/")
                            : variantProduct?.image?.url || "/Images/productplaceholder.png"
                      }
                      alt={variantProduct.name}
                      className={styles.productImage}
                      width={200}
                      height={200}
                    />
                    <p className={styles.productName}>{variantProduct.name}</p>
                    <p className={styles.RelatedPrice}>
                      <span className={styles.special}>
                        {product.__typename === "ConfigurableProduct"
         ? configurableFinalPrice(selectedVariant?.product || product)
         : finalPrice(variantProduct)}
                      </span>
                      {/* <span className={styles.regular}>
                        {product.__typename === "ConfigurableProduct"
    ? configurableFinalPrice(selectedVariant?.product || product)
    : finalPrice(variantProduct)}
                      </span> */}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Button - Visible only on desktop */}
        {/* <button 
          className={styles.Updated_nextButton} 
          onClick={() => {
            const container = document.querySelector(`.${styles.Updated_productsContainer2}`);
            container?.scrollBy({ left: 340, behavior: 'smooth' });
          }}
          aria-label="Next products"
        >
          <Image 
            src="/Images/rightGoldenArrow.png" 
            alt="Right Arrow" 
            width={10} 
            height={40} 
          />
        </button> */}
      </div>
    </div>
  );
}

export default CrossSellProducts;