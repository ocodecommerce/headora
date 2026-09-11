// SearchProduct
"use client"

import React, { useCallback, useEffect, useState, useRef } from "react"
import { Currency } from "../Currency/currency"
import styles from "../../styles/Categories.module.css"
import { useRouter } from "next/router"
import Link from "next/dist/client/link"
import Image from "next/image"
import Filter from "../Filters/Filter"
import { Client } from "@/graphql/client"
import { manufacturer } from "../Category/ManufacturerData"
import { conditions } from "../Category/ConditionsData"

/* ========== Skeletons (CLS-safe) ========== */
const FilterSkeleton = () => (
  <div className={styles.filterSkeleton}>
    <div className={`${styles.skeleton} ${styles.filterSkeletonHeader}`} />
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className={styles.filterSkeletonGroup}>
        <div className={`${styles.skeleton} ${styles.filterSkeletonTitle}`} />
        {[1, 2, 3].map((j) => (
          <div key={j} className={`${styles.skeleton} ${styles.filterSkeletonOption}`} />
        ))}
      </div>
    ))}
  </div>
)

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
  showFilterColumn = true,
  isSortListHovered,
  handleSortOptionClick,
  handleSortListHover,
  productCount,
  setSelectedSortOption,
  selectedSortOption,
  setPriceRange,
  highestPrice,
  lowestPrice,
  priceRange,
  handlePriceRangeChange,
  isLoading,
  showAllFilters = {},
  setShowAllFilters,
}: any) {
  const router = useRouter()
  const client = useRef(new Client()).current

  // Wishlist
  const [wishlistLoading, setWishlistLoading] = useState<{ [key: string]: boolean }>({})
  const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(null)
  const [wishlistId, setWishlistId] = useState<any>(null)
  const [wishlistItems, setWishlistItems] = useState<Record<string, boolean>>({})
  const [wishlistItemIds, setWishlistItemIds] = useState<Record<string, number>>({})
  const [wishlistItemsLoading, setWishlistItemsLoading] = useState<boolean>(false)

  // Cart / Modal
  const [addToLoading, setAddToLoading] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [modalHeading, setModalHeading] = useState<string>("")
  const [modalMessage, setModalMessage] = useState<string>("")

  // Stock (optional – can be wired later if you have a search stock endpoint)
  const [stockStatus, setStockStatus] = useState<any>(null)
  const [loadingStockStatus, setLoadingStockStatus] = useState<boolean>(false)

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  // ========== Wishlist helpers (same pattern as Category) ==========
  const syncWishlistItems = useCallback(async () => {
    if (!userLoggedIn) return
    try {
      const wishlistData = await client.fetchWishListProductsList()
      if (wishlistData?.data?.customer?.wishlists?.length > 0) {
        const wishlist = wishlistData.data.customer.wishlists[0]
        const wishlistProducts = wishlist.items_v2?.items || []
        const wishlistSkuMap: Record<string, boolean> = {}
        const wishlistSkuToItemIdMap: Record<string, number> = {}

        wishlistProducts.forEach((item: any) => {
          if (item.product?.sku) {
            wishlistSkuMap[item.product.sku] = true
            wishlistSkuToItemIdMap[item.product.sku] = item.id
          }
        })

        const updatedWishlistItems: Record<string, boolean> = {}
        const updatedWishlistItemIds: Record<string, number> = {}

        productsData.forEach((productItem: any) => {
          const product = productItem
          let variantProduct = product

          if (product?.__typename === "ConfigurableProduct") {
            const optionValueIndex = product?.configurable_options?.[0]?.values?.[0]?.value_index
            const selectedVariant = product?.variants?.find((variant: any) =>
              variant.attributes.some((attribute: any) => attribute.value_index === optionValueIndex)
            )
            variantProduct = selectedVariant?.product || product
          }

          if (variantProduct.sku && wishlistSkuMap[variantProduct.sku]) {
            updatedWishlistItems[variantProduct.id] = true
            updatedWishlistItemIds[variantProduct.id] = wishlistSkuToItemIdMap[variantProduct.sku]
          }
        })

        setWishlistItems(updatedWishlistItems)
        setWishlistItemIds(updatedWishlistItemIds)
      }
    } catch (error) {
      console.error("Error syncing wishlist items:", error)
    }
  }, [userLoggedIn, productsData, client])

  const checkUserLogin = useCallback(async () => {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return
    }
    try {
      const response = await fetch(`${process.env.baseURL}fcprofile/sync/index`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) throw new Error("Network response was not ok")
      const user = await response.json()
      setUserLoggedIn(user.logged_in)
      if (user.logged_in) await fetchWishlistId()
    } catch (error) {
      console.error("Error checking user login status:", error)
      setUserLoggedIn(false)
    }
  }, [])

  const fetchWishlistId = useCallback(async () => {
    try {
      const wishlistData = await client.fetchWishListID()
      if (wishlistData?.data?.customer?.wishlist?.id) {
        setWishlistId(wishlistData.data.customer.wishlist.id)
      }
    } catch (error) {
      console.error("Error fetching wishlist ID:", error)
    }
  }, [client])

  const openLoginModal = (e?: any) => {
    if (e) e.preventDefault()
    window.dispatchEvent(new Event("openLoginModal"))
  }

  const handleWishlist = useCallback(
    async (productSku: string, productId: string) => {
      setWishlistLoading((prev) => ({ ...prev, [productId]: true }))
      try {
        let loggedIn = userLoggedIn
        if (loggedIn === null) {
          await checkUserLogin()
          loggedIn = userLoggedIn
        }

        if (!loggedIn) {
          openLoginModal()
          return
        }

        let wId = wishlistId
        if (!wId) {
          await fetchWishlistId()
          wId = wishlistId
        }

        if (wId) {
          const result = await client.fetchWishlistMutation(productSku, wId)
          if (result?.data?.addProductsToWishlist?.wishlist) {
            setModalHeading("Success!")
            setModalMessage("Product added to wishlist successfully!")
            setShowModal(true)
            setTimeout(() => setShowModal(false), 4000)
            setWishlistItems((prev) => ({ ...prev, [productId]: true }))
          } else {
            setModalHeading("Error!")
            setModalMessage("Failed to add product to wishlist. Please try again.")
            setShowModal(true)
            setTimeout(() => setShowModal(false), 4000)
          }
        }
      } catch (error) {
        console.error("Error handling wishlist:", error)
        setModalHeading("Error!")
        setModalMessage("Something went wrong. Please try again later.")
        setShowModal(true)
        setTimeout(() => setShowModal(false), 4000)
      } finally {
        setWishlistLoading((prev) => ({ ...prev, [productId]: false }))
      }
    },
    [userLoggedIn, wishlistId, checkUserLogin, fetchWishlistId, client]
  )

  const handleRemoveWishlist = useCallback(
    async (itemId: number) => {
      try {
        setWishlistLoading((prev) => ({ ...prev, [itemId]: true }))
        const response = await client.fetchRemoveWishlistMutation(wishlistId, itemId)
        if (response?.data?.removeProductsFromWishlist?.wishlist) {
          const updatedItems = { ...wishlistItems }
          delete updatedItems[itemId]
          setWishlistItems(updatedItems)
          syncWishlistItems()
        }
      } catch (error) {
        console.error("Error removing from wishlist", error)
      } finally {
        setWishlistLoading((prev) => ({ ...prev, [itemId]: false }))
      }
    },
    [wishlistId, wishlistItems, syncWishlistItems, client]
  )

  useEffect(() => {
    checkUserLogin()
  }, [checkUserLogin])

  useEffect(() => {
    if (userLoggedIn && productsData.length > 0) {
      syncWishlistItems()
    }
  }, [userLoggedIn, productsData, syncWishlistItems])

  // ========== Add to Cart ==========
  const setCookie = useCallback((name: string, value: string, days: number) => {
    let expires = ""
    if (days) {
      const date = new Date()
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
      expires = "; expires=" + date.toUTCString()
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/"
  }, [])

  const getCookie = useCallback((name: string) => {
    const nameEQ = name + "="
    const ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }, [])

  const fetchFormKey = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.baseURL}fcprofile/sync/index`, {
        method: "GET",
      })
      if (!response.ok) throw new Error(`Error fetching form key: ${response.statusText}`)
      const data = await response.json()
      if (data?.form_key) {
        setCookie("form_key", data.form_key, 1)
        return data.form_key
      }
      throw new Error("Form key not found in the response.")
    } catch (error) {
      console.error("Error fetching form key:", error)
      return null
    }
  }, [setCookie])

  const handleAddToCart = useCallback(
    async (productId: string | number, quantity: number) => {
      let formKey = getCookie("form_key")
      if (!formKey) {
        formKey = await fetchFormKey()
        if (!formKey) return
      }

      setAddToLoading(true)
      try {
        const response = await fetch(`${process.env.baseURL}fcprofile/cart/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: productId,
            qty: quantity,
            form_key: formKey,
            options: [],
            super_attributes: [],
          }),
        })
        const result = await response.json()
        if (result.success) {
          localStorage.setItem("cartCount", result.profile.cart_qty)
          localStorage.setItem("showcartBag", "true")
          window.dispatchEvent(new Event("storage"))
        } else {
          setModalHeading("Oops!")
          setModalMessage(
            result.errors?.general_exception?.[0]?.message ||
              result.message ||
              "Something went wrong... Please try again later."
          )
          setShowModal(true)
        }
      } catch (error) {
        setModalHeading("Oops!")
        setModalMessage(
          "Error adding to cart: " + (error instanceof Error ? error.message : "Unknown error")
        )
        setShowModal(true)
      } finally {
        setAddToLoading(false)
      }
    },
    [fetchFormKey, getCookie]
  )

  // ========== Price helpers (same as Category) ==========
  const regularPrice = useCallback((item: any) => {
    const final_price = item?.price_range?.maximum_price?.final_price?.value?.toLocaleString()
    const regular_price = item?.price_range?.maximum_price?.regular_price?.value?.toLocaleString()
    const currency = item?.price?.regularPrice?.amount?.currency

    if (regular_price && final_price && regular_price !== final_price) {
      return `${Currency[currency]}${regular_price}`
    }
    return ""
  }, [])

  const finalPrice = useCallback((item: any) => {
    const final_price = item?.price_range?.maximum_price?.final_price?.value?.toLocaleString()
    const currency = item?.price?.regularPrice?.amount?.currency
    return `${Currency[currency]}${final_price}`
  }, [])

  const getconfigurablePrice = useCallback((item: any) => {
    const regularValue = item?.price_range?.maximum_price?.regular_price?.value
    const finalValue = item?.price_range?.maximum_price?.final_price?.value
    const currency = item?.price_range?.maximum_price?.regular_price?.currency

    if (!regularValue || !finalValue) return ""

    if (regularValue !== finalValue) {
      return `${Currency[currency]}${regularValue.toLocaleString()}`
    }
    return ""
  }, [])

  const configurableFinalPrice = useCallback((item: any) => {
    const final_price = item?.price_range?.maximum_price?.final_price?.value?.toLocaleString()
    const currency = item?.price_range?.maximum_price?.regular_price?.currency
    return `${Currency[currency]}${final_price}`
  }, [])

  // Safe % for dual-range gradient
  const priceSpan = Math.max(1, highestPrice - lowestPrice)
  const leftPct = ((priceRange?.[0] - lowestPrice) / priceSpan) * 100
  const rightPct = ((priceRange?.[1] - lowestPrice) / priceSpan) * 100

  const ProductSkeleton = useCallback(
    () => (
      <div className={styles.item}>
        <div className={styles.skeletonImage}></div>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonPrice}></div>
      </div>
    ),
    [styles]
  )

  return (
    <>
      {showModal && (
        <div className="modal_outer fade-down">
          <div className="modal_contenct">
            <div className="close_icon" onClick={() => setShowModal(false)}>
              <Image width={20} height={20} src={"/Images/cross-23-32.png"} alt="Close Modal" />
            </div>
            <div className="modal_heading">{modalHeading}</div>
            <div className="modal_message">{modalMessage}</div>
          </div>
        </div>
      )}

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
          handlePriceRangeChange={handlePriceRangeChange}
          Currency={Currency}
          priceRange={priceRange}
        />
      )}

      <div className={styles.allProductContainer}>
        {/* Always reserve filter column while checking / when valid */}
        {showFilterColumn && (
          <div className={styles.filterContainer}>
            <div className={styles.filterModal_Desktop} style={{ zIndex: "unset" }}>
              {!hasValidAggregations ? (
                <FilterSkeleton />
              ) : (
                <>
                  <div className={styles.filterHeader}>
                    <label>Filters</label>
                  </div>
                  <div className={styles.filterContent}>
                    <div
                      className={styles.filterGroup}
                      style={{ borderBottom: activeFilters.length === 0 ? "none" : "" }}
                    >
                      <div
                        className={styles.filterLabelContainer}
                        style={{ padding: activeFilters.length === 0 ? "0" : "" }}
                      >
                        {activeFilters
                          .filter((filter: any) => filter.label !== "Price")
                          .map((filter: any, index: number) => {
                            const label = aggrations
                              ?.flatMap((aggregation: any) => aggregation.options)
                              .find((option: any) => option.value === filter.value)?.label
                            return (
                              <span
                                key={`${filter.label}-${filter.value}-${index}`}
                                className={styles.filterGroupLabel}
                              >
                                {`${label || "Unknown"}`}
                                <button
                                  className="remove-filter"
                                  onClick={() => handleRemoveFilter(filter)}
                                >
                                  ╳
                                </button>
                              </span>
                            )
                          })}
                      </div>
                    </div>

                    {aggrations
                      ?.filter(
                        (aggregation: any) =>
                          aggregation.label !== "Category" &&
                          aggregation.label !== "Brand" &&
                          (aggregation.label?.toLowerCase() === "price" ||
                            aggregation.options?.length > 1)
                      )
                      .reverse()
                      .map((aggregation: any) => (
                        <div key={aggregation.label} className={styles.filterGroup}>
                          <h5
                            className={styles.filterGroupTitle}
                            onClick={() => toggleGroup(aggregation.label)}
                          >
                            {aggregation.label.replace(/_/g, " ")}
                            <span className={styles.dropdownArrow}>
                              {openGroups[aggregation.label] ? (
                                <Image
                                  src="/Images/up-arrow.png"
                                  alt="Up Arrow"
                                  height={10}
                                  width={10}
                                />
                              ) : (
                                <Image
                                  src="/Images/down-arrow.png"
                                  alt="Down Arrow"
                                  height={10}
                                  width={10}
                                />
                              )}
                            </span>
                          </h5>

                          {openGroups[aggregation.label] &&
                            (aggregation.label.toLowerCase() === "price" ? (
                              <div className={styles.priceSliderContainer}>
                                <div className={styles.priceRangeLabels}>
                                  <span>
                                    {Currency.USD}
                                    {priceRange?.[0]}
                                  </span>
                                  <span>
                                    {Currency.USD}
                                    {priceRange?.[1]}
                                  </span>
                                </div>
                                <div
                                  className={styles.sliderWrapper}
                                  style={{
                                    background: `linear-gradient(
                                      to right,
                                      #ddd 0%,
                                      #ddd ${leftPct}%,
                                      #1979c3 ${leftPct}%,
                                      #1979c3 ${rightPct}%,
                                      #ddd ${rightPct}%,
                                      #ddd 100%
                                    )`,
                                  }}
                                >
                                  <input
                                    type="range"
                                    min={lowestPrice}
                                    max={highestPrice}
                                    step={Math.max(
                                      1,
                                      Math.round((highestPrice - lowestPrice) / 10)
                                    )}
                                    value={priceRange?.[0] ?? lowestPrice}
                                    onChange={(e) => handlePriceRangeChange(e, 0)}
                                    className={styles.priceSlider}
                                  />
                                  <input
                                    type="range"
                                    min={lowestPrice}
                                    max={highestPrice}
                                    step={Math.max(
                                      1,
                                      Math.round((highestPrice - lowestPrice) / 10)
                                    )}
                                    value={priceRange?.[1] ?? highestPrice}
                                    onChange={(e) => handlePriceRangeChange(e, 1)}
                                    className={styles.priceSlider}
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className={styles.filterOptionsGrid}>
                                  {(showAllFilters[aggregation.label]
                                    ? aggregation.options
                                    : aggregation.options.slice(0, 5)
                                  ).map((option: any) => (
                                    <label key={option.value} className={styles.filterOption}>
                                      <input
                                        type="checkbox"
                                        value={option.value}
                                        checked={isChecked(aggregation.label, option.value)}
                                        onChange={(e) => {
                                          handleCheckboxChange(
                                            aggregation.label,
                                            option.value,
                                            e.target.checked
                                          )
                                        }}
                                      />
                                      {option.label.replace(/_/g, " ")}
                                    </label>
                                  ))}

                                  {aggregation.options.length > 5 && (
                                    <button
                                      type="button"
                                      className={styles.showMoreButton}
                                      onClick={() =>
                                        setShowAllFilters?.((prev: any) => ({
                                          ...prev,
                                          [aggregation.label]: !prev[aggregation.label],
                                        }))
                                      }
                                    >
                                      {showAllFilters[aggregation.label]
                                        ? "Show Less"
                                        : "Show More"}
                                    </button>
                                  )}
                                </div>
                              </>
                            ))}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className={showFilterColumn ? styles.products : styles.productsFullWidth}>
          {isLoading ? (
            <div className={styles.grid}>
              {Array.from({ length: 21 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {productsData && productsData.length > 0 ? (
                <div className={hasValidAggregations ? styles.grid : styles.watch}>
                  {productsData.map((productItem: any, index: number) => {
                    let selectedVariant: any = null
                    let product: any = productItem
                    let optionValueIndex: any =
                      product?.configurable_options?.[0]?.values?.[0]?.value_index

                    if (product?.__typename === "ConfigurableProduct") {
                      selectedVariant = product?.variants?.find((variant: any) =>
                        variant.attributes.some(
                          (attribute: any) => attribute.value_index === optionValueIndex
                        )
                      )
                    }

                    const variantProduct = selectedVariant?.product || product

                    return (
                      <React.Fragment key={index}>
                        <Link
                          href={`/${product.url_key}.html`}
                          key={variantProduct.id}
                          className={styles.item}
                        >
                          {(() => {
                            // Simple sale detection (stock status can be added later)
                            const isOnSale =
                              (product.__typename === "ConfigurableProduct"
                                ? getconfigurablePrice(selectedVariant?.product)
                                : regularPrice(variantProduct)) >
                              (product.__typename === "ConfigurableProduct"
                                ? configurableFinalPrice(selectedVariant?.product)
                                : finalPrice(variantProduct))

                            if (isOnSale) {
                              return <div className={styles.saleTag}>Sale</div>
                            }
                            return null
                          })()}

                          <Image
                            src={
                              variantProduct?.image?.url?.includes("placeholder")
                                ? variantProduct?.media_gallery?.[0]?.url?.includes("cache")
                                  ? variantProduct.media_gallery[0].url.replace(
                                      /\/cache\/.*?\//,
                                      "/"
                                    )
                                  : variantProduct.media_gallery?.[0]?.url
                                : variantProduct?.image?.url
                                  ? variantProduct.image.url.includes("cache")
                                    ? variantProduct.image.url.replace(/\/cache\/.*?\//, "/")
                                    : variantProduct.image.url
                                  : "/Images/productplaceholder.png"
                            }
                            alt={variantProduct.name}
                            width={500}
                            height={500}
                          />

                          <p className={styles.brandName}>
                            {manufacturer.find((c) => c.value === String(product?.manufacturer))?.[
                              "data-title"
                            ] || ""}
                          </p>
                          <span style={{ textDecoration: "none" }}>{variantProduct.name}</span>
                          <p className={styles.conditionName}>
                            {conditions.find((c) => c.value === String(product?.condition))?.[
                              "data-title"
                            ] || ""}
                          </p>
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

                          <div className={styles.actionContainer}>
                            <button
                              className={styles.addToCartButton}
                              onClick={(e) => {
                                e.preventDefault()
                                if (product.__typename === "ConfigurableProduct") {
                                  router.push(`/${product.url_key}.html`)
                                } else {
                                  handleAddToCart(productItem.id, 1)
                                }
                              }}
                            >
                              {!isMobile ? (
                                "add to cart"
                              ) : (
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
                                >
                                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                  <line x1="3" y1="6" x2="21" y2="6"></line>
                                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                              )}
                            </button>

                            {wishlistLoading[variantProduct.id] || wishlistItemsLoading ? (
                              <div className={styles.SearchLoader}></div>
                            ) : wishlistItems[variantProduct.id] ? (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleRemoveWishlist(wishlistItemIds[variantProduct.id])
                                }}
                                style={{ background: "none", border: "none", cursor: "pointer" }}
                              >
                                <Image
                                  src="/Images/wishlistIconFill.png"
                                  height={20}
                                  width={23}
                                  alt="wishlist filled icon"
                                />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleWishlist(variantProduct.sku, variantProduct.id)
                                }}
                                style={{ background: "none", border: "none", cursor: "pointer" }}
                              >
                                <Image
                                  src="/Images/BlackHeart.png"
                                  height={24}
                                  width={27}
                                  alt="wishlist icon"
                                />
                              </button>
                            )}
                          </div>
                        </Link>
                      </React.Fragment>
                    )
                  })}
                </div>
              ) : (
                <p className={styles.productNotFoundMessage}>No products found!</p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default SearchProduct