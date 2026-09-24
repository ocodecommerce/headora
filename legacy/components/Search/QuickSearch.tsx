"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import styles from "../../styles/Header.module.css"

interface QuickSearchProps {
  isSearchOpen: boolean
  toggleSearch: () => void
  searchText: string
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  isLoading: boolean
  searchResults: any[]
  searchCategory?: any
  ref?:any
}

const QuickSearch: React.FC<QuickSearchProps> = ({
  isSearchOpen,
  toggleSearch,
  searchText,
  handleSearchChange,
  handleKeyDown,
  isLoading,
  searchResults,
  searchCategory,
  ref,
}) => {
  if (!isSearchOpen) return null

  return (
    <div className={styles.searchContainer}>
      <div className={styles.inputWrapper}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.searchIcon}
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>

        <input
          type="text"
          placeholder="Search products..."
          className={styles.searchInput}
          value={searchText}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          ref={ref}
          autoFocus
        />

        <svg
          onClick={toggleSearch}
          className={styles.closeIcon}
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>

      <div className={styles.resultsContainer}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.loader}></div>
            Loading...
          </div>
        ) : searchResults?.length > 0 || searchText?.length >= 2 ? (
          <ul className={styles.searchResults}>
            {/* {searchText?.length >= 2 && (
              <li className={styles.searchResultItem}>
                <Link href={`/search?q=${encodeURIComponent(searchText)}`} className={styles.resultLink}>
                <div>
                  <span>Search for "<strong>{searchText}</strong>"</span>
                  <span>&rarr;</span>
                  </div>
                </Link>
              </li>
            )} */}
            {searchCategory?.categories?.items?.slice(0, 3).map((item: any) => (
              <li key={item.id} className={styles.searchResultItem}>
                <Link href={`/${item.url_key}`} onClick={toggleSearch} className={styles.resultLink}>
                  <span>
                    <strong>{searchText}</strong> in {item.name}
                  </span>
                </Link>
              </li>
            ))}
            {searchResults?.length > 0 && (
              <li className={styles.searchResultHeader} style={{
                position: 'sticky',
                top: 0,
                background: '#fff',
                zIndex: 10,
                padding: '10px',
                borderBottom: '1px solid #ccc',
                listStyle: 'none'
              }}>
                <h3>PRODUCT SUGGESTIONS</h3>
              </li>
            )}
            {searchResults.map((item: any) => (
              <li key={item.id} className={styles.searchResultItem}>
                <Link href={`/${item.url_key}`} onClick={toggleSearch} className={styles.resultLink}>
                  <Image
                    src={item.image?.url.replace(/\/cache\/.*?\//, "/") || "/Images/prorate_place_holder.png"}
                    alt={item.name}
                    width={50}
                    height={50}
                    className={styles.searchResultImage}
                    loading="lazy"
                  />
                  <span className={styles.resultText}>{item.name}</span>
                </Link>
              </li>
            ))}


            <li  style={{
                position: 'sticky',
                bottom: 0,
                background: '#fff',
                zIndex: 10,
                padding: '10px',
                borderBottom: '1px solid #ccc',
                listStyle: 'none'
              }}
              className={styles.searchResultItem}>
                <Link href={`/search?query=${encodeURIComponent(searchText)}`} onClick={toggleSearch} className={styles.resultLink}>
                <div  className={styles.bottomsearch}>
                  <span>Search for "<strong>{searchText}</strong>"</span>
                  <span>&rarr;</span>
                  </div>
                </Link>
              </li>
          </ul>
        ) : searchText?.length >= 2 ? (
          <div className={styles.noResults}>No results found</div>
        ) : null}
      </div>
    </div>
  )
}

export default QuickSearch