import React, { useState, useRef } from 'react';
import styles from '../../styles/CollectionPage.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { Currency } from '../Currency/currency';

function CollectionRelatedProducts({ Data, Collection }: any) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsToShow = 4; // Number of items to show in the slider
    const sliderRef = useRef(null);
    if(Data?.products?.items.length >= 0){
        return null
    }
    let startX = 0;

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? Data?.products?.items.slice(0, 6).length - itemsToShow : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === Data?.products?.items.slice(0, 8).length - itemsToShow ? 0 : prevIndex + 1
        );
    };

    const handleDragStart = (e: any) => {
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    };

    const handleDragEnd = (e: any) => {
        const endX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
        const diffX = startX - endX;

        if (Math.abs(diffX) > 50) { // Threshold to prevent accidental small drags
            if (diffX > 0) {
                handleNext();
            } else {
                handlePrev();
            }
        }
    };

    const handleMouseDown = (e: any) => handleDragStart(e);
    const handleMouseUp = (e: any) => handleDragEnd(e);
    const handleTouchStart = (e: any) => handleDragStart(e);
    const handleTouchEnd = (e: any) => handleDragEnd(e);

    function regularPrice(item: any) {
        let final_price = item?.price_range?.maximum_price?.final_price?.value.toLocaleString();
        let regular_price = item?.price_range?.maximum_price?.regular_price?.value.toLocaleString();
        let currency = item?.price?.regularPrice?.amount?.currency;
        if (regular_price !== final_price) {
            return `${Currency[currency]}${regular_price}`;
        } else {
            return '';
        }
    }

    function finalPrice(item: any) {
        let final_price = item?.price_range?.maximum_price?.final_price?.value?.toLocaleString();
        let currency = item?.price?.regularPrice?.amount?.currency;
        return `${Currency[currency]}${final_price}`;
    }

    function getconfigurablePrice(item: any) {
        let price = item?.price_range?.maximum_price?.regular_price?.value?.toLocaleString();
        let regular_price = item?.price_range?.maximum_price?.regular_price?.value?.toLocaleString();
        let currency: any = item?.price_range?.maximum_price?.regular_price?.currency;
    
        if (regular_price != price) {
          return `${Currency[currency]} ${price}`;
        } else {
          return ''
        }
      }

    function configurableFinalPrice(item: any) {
        let final_price = item?.price_range?.maximum_price?.final_price?.value?.toLocaleString();
        let currency = item?.price_range?.maximum_price?.regular_price?.currency;
        return `${Currency[currency]}${final_price}`;
    }

    return (
        <div className={styles.relatedProductsContainer}>
            <h3 className={styles.title}>{Collection?.name} PRODUCT PICKS</h3>
            <div
                className={styles.slider}
                ref={sliderRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <button className={styles.prevButton} onClick={handlePrev}>
                    <Image src="/Images/leftGoldenArrow.png" alt="Left Arrow" width={50} height={50} />
                </button>
                <div className={styles.productsContainer}>
                    <div
                        className={styles.productsGrid}
                        style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
                    >
                        {Data?.products?.items.slice(0, 10).map((product: any) => {
                            let selectedVariant = null;

                            if (product?.__typename === "ConfigurableProduct") {
                                const optionValueIndex = product?.configurable_options?.[0]?.values?.[0]?.value_index;
                                selectedVariant = product?.variants.find((variant: any) =>
                                    variant.attributes.some((attribute: any) => attribute.value_index === optionValueIndex)
                                );
                            }

                            const variantProduct = selectedVariant?.product || product;
                            return (
                                <div key={product.uid} className={styles.productItem}>
                                    <Link  href={`/${product?.url_key}.html`}>
                                        <Image
                                            src={
                                              variantProduct?.image?.url?.includes("placeholder")
                                ? variantProduct?.media_gallery?.[0]?.url?.includes("cache")
                                  ? variantProduct.media_gallery[0].url.replace(/\/cache\/.*?\//, "/")
                                  : variantProduct.media_gallery?.[0]?.url
                                : variantProduct?.image?.url
                                  ? variantProduct.image.url.includes("cache")
                                    ? variantProduct.image.url.replace(/\/cache\/.*?\//, "/")
                                    : variantProduct.image.url
                                  : "/Images/productplaceholder.png"
                                              }
                                            alt={product.name}
                                            className={styles.productImage}
                                            width={300}
                                            height={300}
                                        />
                                        <p className={styles.productName}>{variantProduct.name}</p>
                                        <p className={styles.price}>
                          <span className={styles.special}>
                            {product.__typename === "ConfigurableProduct"
                              ? configurableFinalPrice(selectedVariant?.product)
                              : finalPrice(variantProduct)}
                          </span>
                          <span className={styles.regular}>
                            {product.__typename === "ConfigurableProduct"
                              ? getconfigurablePrice(selectedVariant?.product)
                              : regularPrice(variantProduct)}
                          </span>
                        </p>
                       
                                    </Link>
                                </div>
                            )
                        }
                        )}
                    </div>
                </div>
                <button className={styles.nextButton} onClick={handleNext}>
                    <Image src="/Images/rightGoldenArrow.png" alt="arrow" width={20} height={30} />
                </button>
            </div>
        </div>
    );
}

export default CollectionRelatedProducts;
