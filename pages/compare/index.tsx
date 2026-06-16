import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../../styles/Compare.module.css";
import { useRouter } from "next/navigation";


const COMPARE_KEY = "compareProducts";

const Compare = ({ isMobile }: any) => {
  const [compareItems, setCompareItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const router = useRouter();
  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCompareItems = () => {
    if (typeof window === "undefined") return;
    const items = localStorage.getItem(COMPARE_KEY);
    console.log("Loaded compare items from localStorage:", items);
    setCompareItems(items ? JSON.parse(items) : []);
    setLoading(false);
  };

  useEffect(() => {
    loadCompareItems();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === COMPARE_KEY) loadCompareItems();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const removeFromCompare = (id: string) => {
    const updated = compareItems.filter((item) => item.id !== id);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
    setCompareItems(updated);
    showToast("Product removed from comparison");
  };

  const clearAll = () => {
    localStorage.removeItem(COMPARE_KEY);
    setCompareItems([]);
    showToast("Comparison cleared");
  };


  

  // Reusable Add to Cart (you can improve this later)
  const handleAddToCart = async (product: any) => {
    router.push(`/${product.url_key}.html`);
  };

  if (compareItems.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h1>No products to compare</h1>
        <p>You haven&apos;t added any products to compare yet.</p>
        <Link href="/" className={styles.browseBtn}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (

    <> <div className={styles.navBarSpace}></div>
    <div className={styles.comparePage}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1>Compare Products</h1>
          <p>{compareItems.length} items</p>
        </div>
        <button onClick={clearAll} className={styles.clearBtn}>Clear All</button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.compareTable}>
          <thead>
            <tr>
              <th className={styles.stickyCol}>Attributes</th>
              {compareItems.map((product, idx) => (
                <th key={idx} className={styles.productCol}>
                  <div className={styles.productCard}>
                    <button className={styles.removeBtn} onClick={() => removeFromCompare(product.id)}>
                      ✕
                    </button>

                    <div className={styles.imageWrapper}>
                      <Image
                        src={product.image || "/placeholder.jpg"}
                        alt={product.name}
                        width={220}
                        height={220}
                        className={styles.productImage}
                      />
                    </div>

                    <Link href={`/${product.url_key}.html`} className={styles.productTitle}>
                      {product.name}
                    </Link>

                    <div className={styles.price}>${parseFloat(product.price || 0).toFixed(2)}</div>

                    <button className={styles.addToCartBtn} onClick={() => handleAddToCart(product)}>
                      Add to Cart
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* SKU */}
            <tr>
              <td className={styles.attrName}>SKU</td>
              {compareItems.map((p, i) => <td key={i}>{p.sku}</td>)}
            </tr>

            {/* Rating */}
            <tr>
              <td className={styles.attrName}>Rating</td>
              {compareItems.map((p, i) => (
                <td key={i} className={styles.ratingCell}>
                  <div className={styles.stars}>★★★★☆</div>
                  <small>(No reviews yet)</small>
                </td>
              ))}
            </tr>

            {/* Description */}
            <tr>
              <td className={styles.attrName}>Description</td>
              {compareItems.map((p, i) => (
               <td key={i} className={styles.description}>

                 <div
                        dangerouslySetInnerHTML={{
                          __html:
                            p.description?.html ||
                            p.description?.value ||
                            p.description ||
                            "",
                        }} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.footerActions}>
        <Link href="/" className={styles.continueBtn}>Continue Shopping</Link>
      </div>
    </div>
    </>
  );
};

export default Compare;