

import React from 'react';
import styles from '../../styles/CollectionPage.module.css'
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

function SubCollectionListing({ Collection }: any) {
    const router = useRouter()

    const isHTML = (str: string) => /<[a-z][\s\S]*>/i.test(str);

    // Function to truncate text to a specific word limit
    const truncateText = (text: string, wordLimit: number) => {
        if (text && text.length > 0) {
            return text.split(/\s+/).slice(0, wordLimit).join(" ") + "...";
        } else {
            return text;
        }
    };

    // Function to render the description safely
    const renderDescription = (description: string) => {
        const wordLimit = 70;

        if (isHTML(description)) {
            // Remove HTML tags and truncate
            const plainText = description.replace(/<[^>]*>/g, ""); // Regex to remove HTML tags
            return <p>{truncateText(plainText, wordLimit)}</p>;
        } else {
            // Truncate plain text
            return <p>{truncateText(description, wordLimit)}</p>;
        }
    };



    const generateNewUrl = (itemUrlKey: string) => {
        // Split the current path into segments (words)
        const pathArray = router.asPath.split('/');

        const secondSegment = pathArray[1];

        const newUrl = `/${secondSegment}/${Collection?.url_key}/${itemUrlKey}.html`;

        return newUrl;
    };

    const listClassName = Collection?.children?.length > 15 ? styles.extentedlistingWrapper : styles.listingWrapper;
    const itemClassName = Collection?.children?.length > 15 ? styles.extentedwrapperPushItem : styles.wrapperPushItem;
    return (

        <>
            <div className={styles.CollectionListingContainer}>
                <div className={styles.collectionHeader}>
                    <h2 style={{ textTransform: 'uppercase' }}>{Collection.name} COLLECTIONS</h2>
                    <hr />
                </div>

                <ul className={listClassName}>
                    {Collection?.children?.map((item: any) => (

                        <li key={item.uid} className={itemClassName}>

                            <div className={styles.white_background}></div>
                            <div className={styles.containerWrapper}>
                                <article>
                                    <Link  href={generateNewUrl(item.url_key)}>
                                        <figure>
                                            <picture>
                                                <Image
                                                    src={item?.image ? `${item.image}` : "/Images/prorate_place_holder.png"}
                                                    alt={item?.name || 'placeholder'}
                                                    width={500}  // set width appropriately
                                                    height={500} // set height appropriately
                                                />


                                            </picture>
                                            <figcaption>
                                                <h2>{item.name}</h2>
                                                {renderDescription(item?.description)}
                                           

                                            </figcaption>

                                        </figure>

                                    </Link>
                                </article>
                            </div>
                            <Link  className={styles.shopButton} href={generateNewUrl(item.url_key)}>SHOP </Link>

                        </li>

                    ))}
                </ul>
            </div>
        </>

    );
}
export default SubCollectionListing