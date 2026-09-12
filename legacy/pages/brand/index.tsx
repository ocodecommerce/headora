"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import styles from "../../styles/Brand.module.css"
import Head from "next/head"
import Image from "next/image";
const FEATURED_BRAND_NAMES = ["Chanel", "Rolex", "Cartier", "David Yurman", "Bulgari", "Breitling"]

function Brand({ categoriesList }: any) {


  const brandsCategory = categoriesList.data.categories.items?.[0]?.children.find(
    (category: any) => category.name.toLowerCase() === "brands",
  )

  // Group brands alphabetically
  const groupedBrands = useMemo(() => {
    if (!brandsCategory?.children) return {}

    const groups: { [key: string]: any[] } = {}

    brandsCategory.children.forEach((brand: any) => {
      const firstLetter = brand.name.charAt(0).toUpperCase()
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(brand)
    })

    // Sort brands within each group
    Object.keys(groups).forEach((letter) => {
      groups[letter].sort((a, b) => a.name.localeCompare(b.name))
    })

    return groups
  }, [brandsCategory])

  // Get available letter sections
  const availableLetters = Object.keys(groupedBrands).sort()

  // Group letters for navigation (ABC, DEF, etc.)
  const letterGroups = [
    { label: "ABC", letters: ["A", "B", "C"] },
    { label: "DEF", letters: ["D", "E", "F"] },
    { label: "GHI", letters: ["G", "H", "I"] },
    { label: "JKL", letters: ["J", "K", "L"] },
    { label: "MNO", letters: ["M", "N", "O"] },
    { label: "PQR", letters: ["P", "Q", "R"] },
    { label: "STU", letters: ["S", "T", "U"] },
    { label: "VWX", letters: ["V", "W", "X"] },
    { label: "YZ", letters: ["Y", "Z"] },
  ]


  if (!brandsCategory?.children) {
    return <div className={styles.noBrands}>No brands found</div>
  }

  const featuredBrands = FEATURED_BRAND_NAMES.map((name) => {
    // Find brand by name (case insensitive)
    const brand = brandsCategory?.children.find((brand:any) => brand.name.toLowerCase() === name.toLowerCase())

    return {
      ...brand,
      displayName: name, // Use our consistent display name
      imageSrc: brand?.image || "/Images/placeholder-banner.png",
    }
  }).filter((brand) => brand)

  return (
    <>
    <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{"Top Jewelry and Watch Brands - The Best Luxury Brands | Headora"}</title>
        <meta
          name="description"
          content={"Top Jewelry and Watch Brands - The Best Luxury Brands | Headora"}
        />
        <meta name="keywords" content={"Top Jewelry and Watch Brands - The Best Luxury Brands | Headora"}></meta>
        <meta
          name="robots"
       content="noindex, nofollow"
        />
        <link
          rel="canonical"
          href={`${process.env.baseURL}brand`}
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={"Top Jewelry and Watch Brands - The Best Luxury Brands | Headora"} />
        <meta
          property="og:description"
          content={"Top Jewelry and Watch Brands - The Best Luxury Brands | Headora"}
        />
        <meta
          property="og:url"
          content={`${process.env.baseURL}shipping`}
        />
        <meta property="og:site_name" content="Headora" />
        <meta
          property="og:image"
          content={`${process.env.baseURL}/Images/shippingOG.png`}
        />
        <meta
          property="og:image:secure_url"
          content={`${process.env.baseURL}/Images/brands_OG_Image.png`}
        />
        <meta property="og:image:width" content="907" />
        <meta property="og:image:height" content="487" />
        <meta
          property="og:image:alt"
          content={"Top Jewelry and Watch Brands - The Best Luxury Brands | Headora"}
        />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={"Top Jewelry and Watch Brands - The Best Luxury Brands | Headora"} />
        <meta
          name="twitter:description"
          content={"Top Jewelry and Watch Brands - The Best Luxury Brands | Headora"}
        />
        <meta
          name="twitter:image"
          content={`${process.env.baseURL}/Images/brands_OG_Image.png`}
        />
        <meta name="twitter:label1" content="Time to read" />
        <meta name="twitter:data1" content="1 minute" />
      </Head>

      <div className={styles.FreeSpace}></div>
      <section className={styles.featuredSection}>
      <h1 className={styles.featuredTitle}>FEATURED BRANDS</h1>

      <div className={styles.featuredGrid}>
        {featuredBrands.map((brand, index) => (
          <div key={brand?.uid || index} className={styles.brandCard}>
            <Link href={brand?.url_path+'.html'} className={styles.brandLink}>
              <div className={styles.imageContainer}>
                <Image
                height={200} width={200}
                  src={brand.imageSrc || "/placeholder.svg"}
                  alt={`${brand.displayName} product`}
                  className={styles.brandImage}
                />
              </div>
              <div className={styles.brandName}>
                {brand.displayName}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
      <div className={styles.container}>
        {/* Alphabetical Navigation */}
        <div className={styles.navigationWrapper}>
          <nav className={styles.navigation}>
            {letterGroups.map((group) => {
              const hasLetters = group.letters.some((letter) => availableLetters.includes(letter))

              const handleClick = () => {
                if (!hasLetters) return;
                const targetLetter = group.letters.find((letter) => availableLetters.includes(letter));
                if (targetLetter) {
                  const section = document.getElementById(`section-${targetLetter}`);
                  section?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              };
              return (
                <button
                  key={group.label}
                  onClick={handleClick}
                  className={`${styles.navButton} ${hasLetters ? styles.navButtonActive : styles.navButtonDisabled}`}
                  disabled={!hasLetters}
                >
                  {group.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Brand Sections */}
        <div className={styles.brandGrid}>
          {availableLetters.map((letter) => (
            <div key={letter} id={`section-${letter}`} className={styles.brandSection}>
              {/* Section Header */}
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{letter}</h2>
              </div>

              {/* Brand List */}
              <div className={styles.brandList}>
                {groupedBrands[letter].map((brand: any) => (
                  <div key={brand.uid} className={styles.brandItem}>
                    <Link
                      href={`/${brand.url_path}.html`}
                      className={styles.brandLink}
                    >
                      {brand.name}

                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>


      </div>
    </>
  )
}

export default Brand
