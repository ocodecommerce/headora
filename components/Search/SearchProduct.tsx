"use client"

import React from "react"
import { Currency } from "../Currency/currency"
import styles from "../../styles/Categories.module.css"
import { useRouter } from "next/router"
import Link from "next/dist/client/link"
import Image from "next/image"
import Filter from "../Filters/Filter"

function SearchProduct({
  productsData,
  aggrations,
  activeFilters,
  handleRemoveFilter,
  openGroups,
  toggleGroup,
  handleCheckboxChange,
  handleFilterClick,
  isFilterOpen,
  filters,
  filterOptions,
  setIsFilterOpen,
  setFilters,
  isChecked,
  setActiveFilters,
  hasValidAggregations,
  isSortListHovered,
  handleSortOptionClick,
  handleSortListHover,
  productCount,
  setSelectedSortOption,
  selectedSortOption,
  setPriceRange,
  highestPrice,
  lowestPrice,
  isLoading,
}: any) {
  const router = useRouter()

  function formatPrice(value: number): string {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function regularPrice(item: any) {
    const final_price = item?.price_range?.maximum_price?.final_price?.value
    const regular_price = item?.price_range?.maximum_price?.regular_price?.value
    const currency: any = item?.price?.regularPrice?.amount?.currency

    if (regular_price != final_price) {
      return `${Currency[currency]}${formatPrice(regular_price)}`
    } else {
      return ""
    }
  }

  function finalPrice(item: any) {
    const final_price = item?.price_range?.maximum_price?.final_price?.value
    const currency: any = item?.price?.regularPrice?.amount?.currency
    return `${Currency[currency]}${formatPrice(final_price)}`
  }

  function getconfigurablePrice(item: any) {
    const price = item?.price_range?.maximum_price?.regular_price?.value
    const regular_price = item?.price_range?.maximum_price?.regular_price?.value
    const currency: any = item?.price_range?.maximum_price?.regular_price?.currency

    if (regular_price != price) {
      return `${Currency[currency]} ${formatPrice(price)}`
    } else {
      return ""
    }
  }

  function configurableFinalPrice(item: any) {
    const final_price = item?.price_range?.maximum_price?.final_price?.value
    const currency: any = item?.price_range?.maximum_price?.regular_price?.currency
    return `${Currency[currency]}${formatPrice(final_price)}`
  }

  return (
    <>
      {hasValidAggregations && (
        <Filter
          isSortListHovered={isSortListHovered}
          handleCheckboxChange={handleCheckboxChange}
          handleFilterClick={handleFilterClick}
          handleSortOptionClick={handleSortOptionClick}
          handleSortListHover={handleSortListHover}
          categoriesData={{ products: { aggregations: aggrations } }}
          isFilterOpen={isFilterOpen}
          productCount={productCount}
          filters={filters}
          filterOptions={filterOptions}
          setSelectedSortOption={setSelectedSortOption}
          selectedSortOption={selectedSortOption}
          setIsFilterOpen={setIsFilterOpen}
          activeFilters={activeFilters}
          handleRemoveFilter={handleRemoveFilter}
          setPriceRange={setPriceRange}
          highestPrice={highestPrice}
          lowestPrice={lowestPrice}
          setFilters={setFilters}
          setActiveFilters={setActiveFilters}
        />
      )}

      <div className={styles.allSearchProductContainer}>
        {hasValidAggregations && (
          <div className={styles.filterContainer}>
            <div className={styles.filterModal} style={{ zIndex: "unset" }}>
              <div className={styles.filterHeader}>
                <label>Filter By</label>
              </div>
              <div className={styles.filterContent}>
                <div
                  className={styles.filterGroup}
                  style={{
                    borderBottom: activeFilters.length === 0 ? "none" : "",
                  }}
                >
                  <div
                    className={styles.filterLabelContainer}
                    style={{
                      padding: activeFilters.length === 0 ? "0" : "",
                    }}
                  >
                    {activeFilters.map((filter: any, index: any) => {
                      const label = aggrations
                        ?.flatMap((aggregation: any) => aggregation.options)
                        .find((option: any) => option.value === filter.value)?.label

                      return (
                        <span key={index} className={styles.filterGroupLabel}>
                          {filter.label}: {label || "Unknown"}
                          <button className="remove-filter" onClick={() => handleRemoveFilter(filter)}>
                            &times;
                          </button>
                        </span>
                      )
                    })}
                  </div>
                </div>

                {aggrations
                  .filter((aggregation: any) => aggregation.label !== "Category" && aggregation.label !== "Brand")
                  .map((aggregation: any) => (
                    <div key={aggregation.label} className={styles.filterGroup}>
                     <p className={styles.filterGroupTitle} onClick={() => toggleGroup(aggregation.label)}>
                    {aggregation.label.replace(/_/g, " ")}
                    <span className={styles.dropdownArrow}>
                      {openGroups[aggregation.label] ? (
                        <Image src="/Images/up-arrow.png" alt="Up Arrow" height={10} width={10} />
                      ) : (
                        <Image src="/Images/down-arrow.png" alt="Down Arrow" height={10} width={10} />
                      )}
                    </span>
                  </p>
                      {openGroups[aggregation.label] && (
                        <div className={styles.filterOptionsGrid}>
                          {aggregation.options.map((option: any) => {
                            // Default label
                            let displayLabel = option.label.replace(/_/g, " ");

                            // Custom logic for price range
                            if (aggregation.label.toLowerCase() === "price") {
                              displayLabel = option.label
                                .replace(/^0/, "6") // Replace starting 0 with 6
                                .replace(/-/g, " - "); // Add spaces around hyphen
                            }

                            return (
                              <label key={option.value} className={styles.filterOption}>
                                <input
                                  type="checkbox"
                                  value={option.value}
                                  checked={isChecked(aggregation.label, option.value)}
                                  onChange={(e: any) => {
                                    handleCheckboxChange(aggregation.label, option.value, e.target.checked);
                                  }}
                                />
                                {displayLabel}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        <div className={hasValidAggregations ? styles.SearchProducts : styles.SearchProductsFullWidth}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className="loader"></div>
              {/* <Image src={'/Images/animatedlogo.gif'} alt="anmated logo" height={39} width={39} style={{ marginRight: '5px' }} /> */}
              {/* <div className={styles.loader}></div> */}
            </div>
          ) : (
            <>
              {productsData.length > 0 ? (
                <div className={styles.SearchWatchGrid}>
                  {productsData?.map((product: any, index: any) => {
                    let selectedVariant = null
                    if (product?.__typename === "ConfigurableProduct") {
                      const optionValueIndex = product?.configurable_options?.[0]?.values?.[0]?.value_index
                      selectedVariant = product?.variants.find((variant: any) =>
                        variant.attributes.some((attribute: any) => attribute.value_index === optionValueIndex),
                      )
                    }

                    const variantProduct = selectedVariant?.product || product

                    return (
                      <React.Fragment key={index}>
                        <Link
                          href={`/${product.url_key}.html`}
                          key={product.id}
                          className={`${styles.watchItem} ${styles.search}`}
                        >
                          <Image
                            src={
                              variantProduct?.image?.url
                                ? variantProduct.image.url.includes("cache")
                                  ? variantProduct.image.url.replace(/\/cache\/.*?\//, "/")
                                  : variantProduct.image.url
                                : ""
                            }
                            alt={variantProduct.name}
                            width={500}
                            height={500}
                          />
                          {variantProduct.name.length > 80
                            ? variantProduct.name.slice(0, 80) + "..."
                            : variantProduct.name}
                          <p className={styles.price}>
                            <span className={styles.special}>
                              {product.__typename === "ConfigurableProduct"
                                ? configurableFinalPrice(selectedVariant?.product)
                                : finalPrice(variantProduct)}
                            </span>
                            <span className={styles.regular}>
                              {product.__typename === "ConfigurableProduct"
                                ? getconfigurablePrice(selectedVariant?.product)
                                : regularPrice(variantProduct)}
                            </span>
                          </p>
                        </Link>
                      </React.Fragment>
                    )
                  })}
                </div>
              ) : (
                <p className={styles.productNotFoundMessage}>{isLoading ? "Loading..." : "No products found!"}</p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default SearchProduct
