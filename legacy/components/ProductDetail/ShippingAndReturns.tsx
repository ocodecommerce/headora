import React from 'react'
import styles from '../../styles/ProductDetail.module.css'
import Link from 'next/link';
export default function ShippingAndReturns() {
  return (
    <>
      <div className={styles.productDetailDescriptionContainer}>
         <p><b>Shipping Policy</b></p>
         <p>{`${process.env.siteName}`} ships via Fedex and UPS to street addresses in the continental U.S., Alaska, and Hawaii. We also ship internationally to over 20 countries.  Please be advised an additional charge may be requested based on your international location.  For international buyers, customs / import taxes and fees are the buyer's responsibility. Unfortunately, we cannot deliver to P.O. Boxes, APO/FPO addresses, and U.S. Territories, including Puerto Rico and Guam. {`${process.env.siteName}`} ships Monday through Friday during normal business operating hours.
         </p>

         <p>*Shipment carriers continue to experience delivery delays. While we have updated our shipping timelines to account for these delays, please note that we cannot guarantee delivery timelines - even on expedited orders.</p>
         <p className={styles.readMore} onClick={() => { window.open(`${process.env.baseURLWithoutTrailingSlash}/guide/shipping-policy/`, "_blank") }}>read more...</p>
         
         <p><b>Returns Policy</b></p>
        <p>At {`${process.env.siteName}`}, we are committed to you loving your order. To ensure your satisfaction, we offer a return for credit policy within 7 business days on most items. To check if your item qualifies, please check under the returns tab of the product page you are looking at. Follow the steps below to request a return for credit.
        </p>
        <p className={styles.readMore} onClick={() => { window.open(`${process.env.baseURLWithoutTrailingSlash}/guide/returns-policy/`, "_blank") }}>read more...</p>
       
      </div>
    </>
  )
}
