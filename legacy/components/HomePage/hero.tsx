// app/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from '../../styles/homeUpdated.module.css';

export default function HomePage() {
  return (
    <main className={styles.page}>
      {/* ============ HERO ============ */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <h1 className={styles.heroHeading}>
              Shop the New
              <br />
              Outerwear Collection
            </h1>
            <p className={styles.heroCopy}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Lobortis mattis aliquam faucibus purus.
            </p>
            <button className={styles.btnPrimary}>Shop Now</button>
          </div>
          <div className={styles.heroImageWrap}>
            <img
              className={styles.heroImage}
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80"
              alt="Model wearing sunglasses and a houndstooth blazer"
            />
          </div>
        </div>
        <div className={styles.heroDots}>
          <span className={`${styles.dot} ${styles.dotActive}`} />
          <span className={styles.dot} />
        </div>
      </section>

      {/* ============ CATEGORY CARDS ============ */}
      <section className={styles.categoryGrid}>
        <a className={styles.categoryCard} href="#">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80"
            alt="Woman outdoors in a field"
          />
          <div className={styles.categoryCaption}>
            <h3>Shop Women</h3>
            <p>Lorem ipsum dolor sit</p>
          </div>
        </a>
        <a className={styles.categoryCard} href="#">
          <img
            src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=700&q=80"
            alt="Man smiling on a city street"
          />
          <div className={styles.categoryCaption}>
            <h3>Shop Men</h3>
            <p>Lorem ipsum dolor sit</p>
          </div>
        </a>
        <a className={styles.categoryCard} href="#">
          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80"
            alt="Watch and notebook flat lay"
          />
          <div className={styles.categoryCaption}>
            <h3>What&apos;s New</h3>
            <p>Lorem ipsum dolor sit</p>
          </div>
        </a>
      </section>

      {/* ============ SIGNATURE HEELS ============ */}
      <section className={styles.statement}>
        <div className={styles.statementText}>
          <h2>
            Make a Statement in
            <br />
            Signature Heels
          </h2>
          <h4>Lorem Ipsum Dolor Tempor</h4>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor labore
            <br />
            dolore magna lorem ipsum dolor sit dolore magna lorem ipsum dolor
            sit amet
          </p>
          <div className={styles.statementButtons}>
            <button className={styles.btnOutline}>Shop Heels</button>
            <button className={styles.btnOutline}>Shop All Shoes</button>
          </div>
        </div>
        <div className={styles.statementImageWrap}>
          <img
            src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80"
            alt="Pair of jeweled high heel shoes"
          />
        </div>
      </section>

      {/* ============ VACATION BANNER ============ */}
      <section className={styles.vacation}>
        <div className={styles.vacationImageWrap}>
          <img
            src="https://images.unsplash.com/photo-1533055640609-24b498dfd74c?auto=format&fit=crop&w=1400&q=80"
            alt="Woman in an orange dress on a beach"
          />
        </div>
        <div className={styles.vacationPanel}>
          <h2>
            Vacations meet
            <br />
            fresh style
          </h2>
          <p>Lorem Ipsum Dolor Tempor</p>
          <button className={styles.btnOutlineLight}>Shop Summer</button>
        </div>
      </section>

      {/* ============ TOP SELLERS ============ */}
      <section className={styles.topSellers}>
        <h2 className={styles.topSellersHeading}>Top Sellers</h2>
        <div className={styles.productGrid}>
          {[
            {
              name: "Bellona Skirt",
              price: "$78.00",
              img: "https://images.unsplash.com/photo-1583496661160-fb5886a13d05?auto=format&fit=crop&w=500&q=80",
            },
            {
              name: "Rowena Skirt",
              price: "$78.00",
              img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=80",
            },
            {
              name: "Johanna Skirt",
              price: "$78.00",
              img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=500&q=80",
            },
            {
              name: "Daria Crochet Skirt",
              price: "$98.00",
              img: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=500&q=80",
            },
            {
              name: "Agatha Skirt",
              price: "$78.00",
              img: "https://images.unsplash.com/photo-1583496661160-fb5886a13d05?auto=format&fit=crop&w=500&q=80",
            },
          ].map((product) => (
            <div className={styles.productCard} key={product.name}>
              <div className={styles.productImageWrap}>
                <img src={product.img} alt={product.name} />
              </div>
              <h4 className={styles.productName}>{product.name}</h4>
              <p className={styles.productPrice}>{product.price}</p>
              <button className={styles.btnPrimarySmall}>Add to Cart</button>
            </div>
          ))}
        </div>
        <div className={styles.scrollTrack}>
          <div className={styles.scrollThumb} />
        </div>
      </section>
    </main>
  );
}