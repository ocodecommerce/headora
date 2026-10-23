import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../../styles/Footer.module.css';

// Sign In / Register open the header's modals (Header listens for these events).
const openModal = (name: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  window.dispatchEvent(new Event(name));
};
// Order history is served by Magento (nginx routes /sales to it).
const ORDER_STATUS = "/sales/order/history/";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Account Section */}
        <div className={styles.column}>
          <span>Account</span>
          <a href="#" onClick={openModal("openLoginModal")}>Sign In</a>
          <a href="#" onClick={openModal("openSignUpModal")}>Register</a>
          <a href={ORDER_STATUS}>Order Status</a>
          <Link href="/customer-service">Returns</Link>
        </div>

        {/* About Us Section */}
        <div className={styles.column}>
          <span>About Us</span>
          <Link href="/our-story">Our Story</Link>
          <a href="#newsletter">Email Signup</a>
          <Link href="/our-story">Give Back</Link>
        </div>

        {/* Help Section */}
        <div className={styles.column}>
          <span>Help</span>
          <Link href="/customer-service">Customer Service</Link>
          <Link href="/contact-us">Contact Us</Link>
          <a href={ORDER_STATUS}>Order Status</a>
          <Link href="/customer-service">Returns</Link>
        </div>

        {/* Follow Us Section */}
        <div className={`${styles.column} ${styles.expandDesktop}`}>
          <span>Follow Us!</span>
          <p className={styles.footerDescription}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.</p>
          <div className={styles.socialLinks}>
            <Link href="#instagram" passHref>
       
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
          
            </Link>
            <Link href="#facebook" passHref>
       
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
  
            </Link>
            <Link href="#twitter" passHref>
       
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                </svg>
    
            </Link>
          </div>
        </div>

        {/* Subscribe Section */}
        <div id="newsletter" className={`${styles.column} ${styles.expand}`}>
          <span>Subscribe to {`${process.env.siteName}`}</span>
          <p className={styles.footerDescription}>Recieve the latest news, update and special offers right to your inbox.</p>
          <div className={styles.subscribeForm}>
            <input
              type="email"
              placeholder=""
              className={styles.subscribeInput}
            />
            <span className={styles.subscribeButton}>
              Subscribe
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        <Link href={'/'} className={styles.footerLogo}>
        {process.env.logoURL?.length == 0 ? (
          `${process.env.logoText}`
        ):(
       
       <Image
          src={`${process.env.logoText}`}
          alt="Logo"
          width={120}
          height={35}
          className={styles.logo}
        /> 
      )}
        </Link>
        <div className={styles.copyright}>
          Copyright © 2026 oCodecommerce.com, All rights reserved.
        </div>
        <div className={styles.legalLinks}>
          <Link href="/terms-of-service">Terms of Use</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;