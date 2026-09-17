import React from 'react'
import styles from '../../styles/ProductDetail.module.css'
import Link from 'next/link';
function Guarantee() {
    return (
        <>
            <div className={styles.productDetailDescriptionContainer}>
                <p>We stand behind the quality and craftsmanship of our jewelry. {`${process.env.siteName}`} offers a free lifetime warranty against manufacturing defects on all {`${process.env.siteName}`} fine jewelry.</p>
                <p>If you experience damage to your purchase due to manufacturing, we recommend you contact us so we may evaluate your piece. Customers in the US, CAN, AUS, and UK will receive free return labels. For customers outside of those countries, a $50 deposit will be taken before the shipment of your item to {`${process.env.siteName}`} for evaluation, which covers the cost of shipping the item and an evaluation by our expert jewelers to determine if the damage is warrantied. This fee is refunded in full for all warrantied repairs. We also offer complimentary shipping back to the customer for all warrantied repairs. Repairs that are not covered under the lifetime warranty will have a price quoted to the customer for approval before work is performed. If approved, the deposit will be applied to this repair. If the customer chooses not to perform the repair, the deposit will be applied to cover the shipping charge back to the customer after evaluation.
                    If a warranty issue is found, {`${process.env.siteName}`} will repair the warrantied damage or replace the item without charge.</p>
                <p>Repair or service performed by a jeweler other than {`${process.env.siteName}`} will void the warranty. {`${process.env.siteName}`} will replace any damaged fine jewelry within 60 days of purchase. Outside of those 60 days, {`${process.env.siteName}`} will replace fine jewelry pieces under $1,000 in value. All fine jewelry can be affected by normal wear, activities, or trauma. This is especially true for rings, since hands are actively used and subject to daily pressure. Our manufacturing warranty excludes coverage for wear and tear, loss of gemstones, product loss, or theft. Coverage also excludes damage or loss caused by a failure to obtain the repairs required to preserve the integrity of the jewelry.</p>
                <p>Some examples of common jewelry issues that would not be considered manufacturing defects include:
                    The discoloration of precious metals caused by chemicals, make-up, immersion in pools and hot tubs, or bathing.
                    Precious metals, and especially prongs, wear down over time and may require restoration work as part of normal wear. Prongs catching, wearing out, or bending over time due to everyday wear or normal damage, allowing a gemstone to fall out.</p>
                <p>The loss of a gemstone caused by damage from everyday wear or from other damage.
                    {`${process.env.siteName}`} offers extended service plans at an additional charge which cover many common wear and tear issues. We also recommend that you maintain independent insurance coverage for your jewelry to help cover significant damage, loss, or theft. Please email us at support@{`${process.env.siteName}`}.com for more information.</p>

            </div>
        </>
    )
}
export default Guarantee