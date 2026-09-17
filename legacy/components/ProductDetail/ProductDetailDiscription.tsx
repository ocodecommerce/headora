import React, { useEffect, useState } from 'react';
import styles from '../../styles/ProductDetail.module.css';

interface ProductDetailDescriptionProps {
  currentVariant: {
    description?: {
      html?: string;
      [key: string]: any;
    } | string;
    [key: string]: any;
  };
}

function ProductDetailDescription({ currentVariant, Data }: any) {
  const [descriptionHTML, setDescriptionHTML] = useState<string>('');

  useEffect(() => {
    if (currentVariant && currentVariant.description) {
      let htmlData = typeof currentVariant.description === 'string'
        ? currentVariant.description
        : currentVariant.description.html || '';

      // Format the HTML content
      htmlData = htmlData
        .replace(/(?:\r\n|\r|\n)/g, '<br>') // Replace line breaks with <br>
        .replace(/<br><br>/g, '<br>') // Remove double <br>
        .replace(/<\/p><br><p>/g, '</p><p>'); // Fix <p> and <br> tag mismatch
      htmlData = `<p>${htmlData}</p>`; // Wrap content in <p> tags

      setDescriptionHTML(htmlData);
    }
  }, [currentVariant]);

  return (
    <div className={styles.navbarContainer}>
      <ul className={styles.navList}>

        <li className={styles.navItem}>
          <div className={styles.navItemHeading}>
            <h4>Description</h4>
          </div>
          <div className={styles.productDetailDescriptionContainer}>
            <div dangerouslySetInnerHTML={{ __html: descriptionHTML }} />
          </div>
        </li>
        <li className={styles.navItem2}>
          <div className={styles.navItemHeading}>
            <h4>Details</h4>
          </div>
          <div className={styles.productDetailDescriptionContainer}>
            <ul>
              <li>
              <strong>SKU: </strong>{currentVariant ? currentVariant.sku : Data?.sku}
              </li>
              {currentVariant?.attributes?.map((label:any, index:any)=>(
                <li key={index}>
                  <strong style={{textTransform:'capitalize'}}>{label?.code.replace("_"," ")}:</strong> {label?.label}
                </li>
              ))}
      
            </ul>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default ProductDetailDescription;
