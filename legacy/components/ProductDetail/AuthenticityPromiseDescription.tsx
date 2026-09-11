import Link from "next/link";
import styles from "../../styles/ProductDetail.module.css";

function AuthenticityPromiseDescription() {
  return (
    <>
      <p className={styles.AuthenticityTabSubcontent}>
        Headora promises authenticity of our products. Learn more about
        Headora's{" "}
        <Link href={"/authenticity-promise"}>authenticity promise</Link>.{" "}
      </p>
      <div id="authenticity" className={styles.AuthenticityTabContent}>
        <div className={styles.AuthenticityAuthWrapper}>
          <div className={styles.AuthenticityAuth}>
         
            <div className={styles.AuthenticityAuthText}>
              We understand the importance of every jewelry and watch purchase.
              To ensure you have a seamless and secure experience with
              Headora, we offer:
            </div>
            <ul className={styles.AuthenticityList}>
              <li className={styles.AuthenticityListItem}>
                <div className={styles.Label}>WARRANTY</div>
                <div className={styles.Description}>
                  2 years on "Never Worn" watches and 1 year on "Pre-Owned"
                  watches.
                </div>
              </li>
              <li className={styles.AuthenticityListItem}>
                <div className={styles.Label}>SERVICE</div>
                <div className={styles.Description}>
                  An expert concierge team to assist every step of the way.
                </div>
              </li>
              <li className={styles.AuthenticityListItem}>
                <div className={styles.Label}>SECURITY</div>
                <div className={styles.Description}>
                  All transactions are secure and confidential. Every package is
                  insured and protected for delivery.
                </div>
              </li>
              <li className={styles.AuthenticityListItem}>
                <div className={styles.Label}>EXPERIENCE</div>
                <div className={styles.Description}>
                  A reliable marketplace where you can shop knowing that if you
                  find your item to be not as expected, we’ll help solve the
                  problem with the seller.
                </div>
              </li>
            </ul>
          </div>
          <div className={styles.AuthenticityViewPromise}>
            <Link href="/authenticity-promise">VIEW OUR PROMISE</Link>
          </div>
        </div>
      </div>
    </>
  );
}
export default AuthenticityPromiseDescription;
