"use client"

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { Currency } from "../Currency/currency"
import styles from "../../styles/Categories.module.css"
import Image from "next/image"
import { useRouter } from "next/router"
import Pagination from "./pagination"
import Filter from "../Filters/Filter"
import Link from "next/dist/client/link"
import { Client } from "@/graphql/client"
import { manufacturer } from "../Category/ManufacturerData"
import { conditions } from "../Category/ConditionsData"
import { debounce } from "lodash"

let filterOptions: any = []

const productsPerPage = 21

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

function CategoriesProducts({
  iscollectionData,
  productsData,
  categoriesData,
  categoryDetail,
  showRibbon,
  isMobile,
}: any) {
  const router = useRouter()

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [changeCheckPage, setChangeCheckPage] = useState<boolean>(false)

  // Products
  const [displayedProducts, setDisplayedProducts] = useState<any[]>(productsData || [])
  const [pendingProducts, setPendingProducts] = useState<any[] | null>(null)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [productCount, setProductCount] = useState<number>(0)

  // Filters
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 80000])
  const [highestPrice, setHighestPrice] = useState<number>(0)
  const [lowestPrice, setLowestPrice] = useState<number>(0)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [activeFilters, setActiveFilters] = useState<any[]>([])
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [selectedSortOption, setSelectedSortOption] = useState<string>("")
  const [showAllFilters, setShowAllFilters] = useState<Record<string, boolean>>({})

  // Loading
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [addToLoading, setAddToLoading] = useState<boolean>(false)
  const [loadingStockStatus, setLoadingStockStatus] = useState<boolean>(true)

  // Modal
  const [showModal, setShowModal] = useState<boolean>(false)
  const [modalHeading, setModalHeading] = useState<string>("")
  const [modalMessage, setModalMessage] = useState<string>("")

  // UI
  const [isSortListHovered, setIsSortListHovered] = useState<boolean>(false)
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false)
  const [hasValidAggregations, setHasValidAggregations] = useState<boolean>(false)
  const [filtersReady, setFiltersReady] = useState<boolean>(false)

  // Wishlist
  const [wishlistLoading, setWishlistLoading] = useState<{ [key: string]: boolean }>({})
  const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(null)
  const [wishlistId, setWishlistId] = useState<any>(null)
  const [wishlistItems, setWishlistItems] = useState<Record<string, boolean>>({})
  const [wishlistItemIds, setWishlistItemIds] = useState<Record<string, number>>({})
  const [wishlistItemsLoading, setWishlistItemsLoading] = useState<boolean>(false)

  // Stock
  const [stockStatus, setStockStatus] = useState<any>(null)

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [activeSortField, setActiveSortField] = useState<string>("")

  const client = useRef(new Client()).current

  // Refs
  const filtersRef = useRef(filters)
  const selectedSortOptionRef = useRef(selectedSortOption)
  const activeFiltersRef = useRef(activeFilters)
  const currentPageRef = useRef(currentPage)
  const categoryDetailRef = useRef(categoryDetail)
  const isApplyingFilterRef = useRef(false)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])
  useEffect(() => {
    selectedSortOptionRef.current = selectedSortOption
  }, [selectedSortOption])
  useEffect(() => {
    activeFiltersRef.current = activeFilters
  }, [activeFilters])
  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])
  useEffect(() => {
    categoryDetailRef.current = categoryDetail
  }, [categoryDetail])

  // Reserve filter column while checking / when valid → no layout shift
  const showFilterColumn = !filtersReady || hasValidAggregations

  useEffect(() => {
    const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 768)
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  useEffect(() => {
    if (categoriesData?.products?.aggregations) {
      filterOptions = categoriesData.products.aggregations.map((element: any) => ({
        label: element?.label,
        value: element?.attribute_code,
      }))
    }
  }, [categoriesData])

  useEffect(() => {
    const validAggregations = categoriesData?.products?.aggregations?.some(
      (aggregation: any) => aggregation.label && aggregation.label !== "0"
    )
    setHasValidAggregations(!!validAggregations)
    setFiltersReady(true)
  }, [categoriesData])

  useEffect(() => {
    if (!categoriesData?.products?.aggregations) return

    const initialState: Record<string, boolean> = {}
    categoriesData.products.aggregations
      .filter(
        (aggregation: any) => aggregation.label !== "Category" && aggregation.label !== "Brand"  &&
        (
          aggregation.options?.length > 1
        ) 
      )
      .reverse()
      .slice(0, 3)
      .forEach((aggregation: any) => {
        initialState[aggregation.label] = true
      })

    setOpenGroups(initialState)
  }, [categoriesData])

  // Price bounds from products
  useEffect(() => {
    const calculatePriceRange = (products: any[]) => {
      if (!products || products.length === 0) {
        setLowestPrice(0)
        setHighestPrice(0)
        return
      }

      const prices = products
        .map((product) => {
          const finalPrice =
            product?.price_range?.maximum_price?.final_price?.value ||
            product?.price_range?.minimum_price?.final_price?.value

          if (typeof finalPrice === "number" && !isNaN(finalPrice) && finalPrice > 0) {
            return finalPrice
          }

          const regularPrice = product?.price?.regularPrice?.amount?.value
          if (typeof regularPrice === "number" && !isNaN(regularPrice) && regularPrice > 0) {
            return regularPrice
          }

          return null
        })
        .filter((price): price is number => price !== null)

      if (prices.length === 0) {
        setLowestPrice(0)
        setHighestPrice(0)
        return
      }

      const rawMin = Math.min(...prices)
      const rawMax = Math.max(...prices)
      const stepSize = 10
      const lowest = Math.floor(rawMin / stepSize) * stepSize
      const highest = Math.ceil(rawMax / stepSize) * stepSize
      const adjustedLowest = Math.max(0, lowest)
      const adjustedHighest = Math.max(adjustedLowest + stepSize, highest)

      setLowestPrice(adjustedLowest)
      setHighestPrice(adjustedHighest)
      setPriceRange([adjustedLowest, adjustedHighest])
    }

    calculatePriceRange(productsData)
  }, [productsData])

  useEffect(() => {
    if (productsData) {
      setDisplayedProducts(productsData)
      const total = categoriesData?.products?.total_count || productsData.length || 0
      setProductCount(total)
      setTotalPages(Math.ceil(total / productsPerPage))
    }
  }, [productsData, categoriesData])

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

        displayedProducts.forEach((productItem: any) => {
          const product = productItem
          let variantProduct = product

          if (product?.__typename === "ConfigurableProduct") {
            const optionValueIndex = product?.configurable_options?.[0]?.values?.[0]?.value_index
            const selectedVariant = product?.variants.find((variant: any) =>
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
  }, [userLoggedIn, displayedProducts, client])

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
          // router.push("/customer/account/login/")
          openLoginModal(new MouseEvent("click") as any)
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
        } else {
          setModalHeading("Error!")
          setModalMessage("Unable to access wishlist. Please try again.")
          setShowModal(true)
          setTimeout(() => setShowModal(false), 4000)
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
    [userLoggedIn, wishlistId, checkUserLogin, fetchWishlistId, router, client]
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
        } else {
          console.error("Failed to remove from wishlist")
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
    if (userLoggedIn && displayedProducts.length > 0) {
      syncWishlistItems()
    }
  }, [userLoggedIn, displayedProducts, syncWishlistItems])

  const fetchStockData = useCallback(async () => {
    if (!categoryDetail?.url_path) return
    setLoadingStockStatus(true)
    try {
      const data = await client.fetchCategoryProductsStockStatus(categoryDetail.url_path, currentPage)
      if (data) {
        const stockItems = data?.data?.categoryList?.[0]?.products?.items
        setStockStatus(stockItems)
      }
    } catch (err) {
      console.error("Error fetching stock data:", err)
    } finally {
      setLoadingStockStatus(false)
    }
  }, [categoryDetail, currentPage, client])

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

  const fetchProductsForPage = useCallback(
    async (page: number) => {
      if (!categoryDetail?.uid) return
      setIsLoading(true)
      try {
        const cleanedUrlPath = categoryDetail.url_path.replace(/\/$/, "")
        const response = await client.fetchSubCategoryDataByUrlKey(cleanedUrlPath, page)
        if (response?.categoryList?.[0]?.products?.items?.length > 0) {
          setPendingProducts(response.categoryList[0].products.items)
          setProductCount(response.categoryList[0].products.total_count || 0)
          setTotalPages(
            Math.ceil((response.categoryList[0].products.total_count || 0) / productsPerPage)
          )
        } else {
          setPendingProducts([])
          setProductCount(0)
          setTotalPages(0)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        if (page === 1 && activeFiltersRef.current.length === 0) {
          setPendingProducts(productsData)
          setProductCount(categoriesData?.products?.total_count || 0)
          setTotalPages(Math.ceil((categoriesData?.products?.total_count || 0) / productsPerPage))
        } else {
          setPendingProducts([])
          setProductCount(0)
          setTotalPages(0)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [categoryDetail, productsData, categoriesData, client]
  )

  useEffect(() => {
    if (pendingProducts !== null) {
      setDisplayedProducts(pendingProducts)
    }
  }, [pendingProducts])

  useEffect(() => {
    const pageFromQuery = router.query.page ? parseInt(router.query.page as string, 10) : 1
    const safePage = isNaN(pageFromQuery) ? 1 : Math.max(1, Math.min(pageFromQuery, totalPages || 1))

    if (safePage !== currentPage) {
      setCurrentPage(safePage)
    }
  }, [router.query.page, totalPages])

  const pathWithoutQuery = router.asPath.split("?")[0]
  const slugs = pathWithoutQuery.split("/").filter(Boolean)

  const breadcrumbs = useMemo(
    () => [
      { name: "Home", path: "/" },
      ...slugs.map((slugPart: string, index: number) => ({
        name: slugPart.replace(/-/g, " "),
        path: `/${slugs.slice(0, index + 1).join("/")}`,
      })),
    ],
    [slugs]
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("breadcrumbs", JSON.stringify(breadcrumbs))
    }
  }, [breadcrumbs])

  const getSortingParam = useCallback((sortOption: string): Record<string, string> => {
    switch (sortOption) {
      case "productNameAtoZ":
        return { name: "ASC" }
      case "productNameZtoA":
        return { name: "DESC" }
      case "priceHighToLow":
        return { price: "DESC" }
      case "priceLowToHigh":
        return { price: "ASC" }
      default:
        return {}
    }
  }, [])

  const applyProductFilter = useMemo(() => {
    const debouncedFn = debounce(async (filter: any, page: number, sort: string) => {
      if (isApplyingFilterRef.current) return
      isApplyingFilterRef.current = true

      setIsLoading(true)

      try {
        const hasFilters = Object.keys(filter).length > 0
        const hasSort = sort && sort !== "none"

        if (!hasFilters && !hasSort && page === 1) {
          setPendingProducts(productsData)
          const total = categoriesData?.products?.total_count || productsData?.length || 0
          setProductCount(total)
          setTotalPages(Math.ceil(total / productsPerPage))
          isApplyingFilterRef.current = false
          setIsLoading(false)
          return
        }

        const graphqlFilter: Record<string, any> = {
          category_uid: { eq: categoryDetailRef.current?.uid },
        }

        for (const key in filter) {
          if (key === "price" && filter[key]) {
            graphqlFilter.price = {
              from: String(filter[key][0]),
              to: String(filter[key][1]),
            }
          } else if (filter[key] && filter[key].length > 0) {
            const filterOption = filterOptions.find((option: any) => option.value === key)

            if (filterOption) {
              const attributeName = filterOption.value
              graphqlFilter[attributeName] =
                filter[key].length === 1 ? { eq: filter[key][0] } : { in: filter[key] }
            }
          }
        }

        const formatObject = (obj: Record<string, any>): string => {
          if (!obj || Object.keys(obj).length === 0) return "{}"

          const formatValue = (val: any, key?: string): string => {
            if (typeof val === "string") {
              if (["lux_ring_size"].includes(key!) && !isNaN(Number(val))) {
                return val
              }
              return `"${val}"`
            } else if (Array.isArray(val)) {
              return `[${val.map((v) => formatValue(v, key)).join(", ")}]`
            } else if (typeof val === "object" && val !== null) {
              return `{ ${Object.entries(val)
                .map(([k, v]) => `${k}: ${formatValue(v, k)}`)
                .join(", ")} }`
            } else {
              return `${val}`
            }
          }

          return `{ ${Object.entries(obj)
            .map(([key, value]) => `${key}: ${formatValue(value, key)}`)
            .join(", ")} }`
        }

        const formatSortObject = (obj: Record<string, string> | null): string => {
          if (!obj || Object.keys(obj).length === 0) return "{}"
          return `{ ${Object.entries(obj)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ")} }`
        }

        const sortParam = sort && sort !== "none" ? getSortingParam(sort) : {}

        const response = await client.fetchCategoryFilterProductResult(
          "",
          page,
          formatObject(graphqlFilter),
          formatSortObject(sortParam)
        )

        if (response?.products?.items?.length > 0) {
          setPendingProducts(response.products.items)
          setProductCount(response.products.total_count || 0)
          setTotalPages(Math.ceil((response.products.total_count || 0) / productsPerPage))
        } else {
          setPendingProducts([])
          setProductCount(0)
          setTotalPages(0)
        }
      } catch (error) {
        console.error("Error applying filters:", error)
        setPendingProducts([])
        setProductCount(0)
        setTotalPages(0)
      } finally {
        setIsLoading(false)
        isApplyingFilterRef.current = false
      }
    }, 500)

    return debouncedFn
  }, [client, getSortingParam, productsData, categoriesData])

  useEffect(() => {
    if (!categoryDetail?.uid) return

    if (!changeCheckPage) {
      setCurrentPage(1)
      const newQuery = { ...router.query }
      delete newQuery.page
      router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true })
    }

    setChangeCheckPage(false)
    applyProductFilter(filters, 1, selectedSortOption)
  }, [selectedSortOption, filters, categoryDetail?.uid])

  const toggleDropdown = useCallback((label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label))
  }, [])

  const closeDropDown = useCallback(() => {
    setOpenDropdown(null)
  }, [])

  const handleCheckboxChange = useCallback(
    (aggregationLabel: string, optionValue: string, isChecked: boolean) => {
      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters }

        filterOptions.forEach((option: any) => {
          if (option.label === aggregationLabel) {
            const key = option.value

            if (isChecked) {
              if (!newFilters[key]) {
                newFilters[key] = [optionValue]
              } else if (!newFilters[key].includes(optionValue)) {
                newFilters[key] = [...newFilters[key], optionValue]
              }
            } else {
              if (newFilters[key]) {
                newFilters[key] = newFilters[key].filter((value: string) => value !== optionValue)
                if (newFilters[key].length === 0) {
                  delete newFilters[key]
                }
              }
            }
          }
        })

        return newFilters
      })

      setActiveFilters((prev) => {
        if (isChecked) {
          const exists = prev.some((f) => f.label === aggregationLabel && f.value === optionValue)
          if (exists) return prev
          return [...prev, { label: aggregationLabel, value: optionValue }]
        } else {
          return prev.filter(
            (item) => !(item.label === aggregationLabel && item.value === optionValue)
          )
        }
      })
    },
    []
  )

  const handleRemoveFilter = useCallback((filterToRemove: any) => {
    setActiveFilters((prev) =>
      prev.filter(
        (filter) =>
          !(filter.label === filterToRemove?.label && filter.value === filterToRemove?.value)
      )
    )

    setFilters((prev) => {
      const updatedFilters = { ...prev }

      // Price chip removal
      if (filterToRemove?.label === "Price") {
        delete updatedFilters.price
        return updatedFilters
      }

      filterOptions.forEach((option: any) => {
        if (option?.label === filterToRemove?.label) {
          const key = option.value
          if (updatedFilters[key]) {
            updatedFilters[key] = updatedFilters[key].filter(
              (val: string) => val !== filterToRemove.value
            )
            if (updatedFilters[key].length === 0) {
              delete updatedFilters[key]
            }
          }
        }
      })
      return updatedFilters
    })
  }, [])

  // ========== FIXED PRICE RANGE HANDLER ==========
  const handlePriceRangeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const value = Number(event.target.value)

      setPriceRange((prev) => {
        let min = prev[0]
        let max = prev[1]

        if (index === 0) {
          // Left thumb cannot cross right
          min = Math.min(value, max)
        } else {
          // Right thumb cannot cross left
          max = Math.max(value, min)
        }

        const newRange: [number, number] = [min, max]

        // Sync filters + activeFilters with the same values (no stale state)
        setFilters((prevFilters) => ({
          ...prevFilters,
          price: newRange,
        }))

        setActiveFilters((prev) => {
          const otherFilters = prev.filter((f) => f.label !== "Price")
          return [
            ...otherFilters,
            { label: "Price", value: `${newRange[0]}_${newRange[1]}` },
          ]
        })

        return newRange
      })
    },
    []
  )

  const handleSortOptionClick = useCallback((value: string) => {
    setActiveSortField(value)
    setSelectedSortOption(value)
  }, [])

  const handleSortListHover = useCallback((isHovered: boolean) => {
    setIsSortListHovered(isHovered)
  }, [])

  const handleFilterClick = useCallback(() => {
    setIsFilterOpen((prev) => !prev)
  }, [])

  const toggleGroup = useCallback((groupLabel: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }))
  }, [])

  const isChecked = useCallback(
    (label: string, value: string) => {
      const option = filterOptions.find((opt: any) => opt.label === label)
      if (!option) return false
      return filters[option.value]?.includes(value) || false
    },
    [filters]
  )

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

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return

      window.scrollTo({ top: 0, behavior: "smooth" })

      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, page },
        },
        undefined,
        { shallow: true }
      )

      setChangeCheckPage(true)
      setCurrentPage(page)

      if (activeFiltersRef.current.length > 0 || selectedSortOptionRef.current) {
        applyProductFilter(filtersRef.current, page, selectedSortOptionRef.current)
      } else {
        fetchProductsForPage(page)
      }
    },
    [router, totalPages, currentPage, applyProductFilter, fetchProductsForPage]
  )

  useEffect(() => {
    return () => {
      applyProductFilter.cancel()
    }
  }, [applyProductFilter])

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

  // Safe % for dual-range gradient (avoid /0)
  const priceSpan = Math.max(1, highestPrice - lowestPrice)
  const leftPct = ((priceRange[0] - lowestPrice) / priceSpan) * 100
  const rightPct = ((priceRange[1] - lowestPrice) / priceSpan) * 100



  const openLoginModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
  
    window.dispatchEvent(new Event("openLoginModal"));
  };

  const openSignUpModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
  
    window.dispatchEvent(new Event("openSignUpModal"));
  };


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
          categoriesData={categoriesData}
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
                            const label = categoriesData?.products?.aggregations
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

                    {categoriesData?.products?.aggregations
                      ?.filter(
                        (aggregation: any) =>
                          aggregation.label !== "Category" && aggregation.label !== "Brand" &&
                        (
                          aggregation.label.toLowerCase() === "price" ||
                          aggregation.options?.length > 1
                        ) 
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
                            (aggregation.label.toLowerCase() === "price"  ? (
                              <div className={styles.priceSliderContainer}>
                                <div className={styles.priceRangeLabels}>
                                  <span>
                                    {Currency.USD}
                                    {priceRange[0]}
                                  </span>
                                  <span>
                                    {Currency.USD}
                                    {priceRange[1]}
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
                                    value={priceRange[0]}
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
                                    value={priceRange[1]}
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
                                        setShowAllFilters((prev) => ({
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
              {Array.from({ length: productsPerPage }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {displayedProducts && displayedProducts.length > 0 ? (
                <div className={hasValidAggregations ? styles.grid : styles.watch}>
                  {displayedProducts.map((productItem: any, index: number) => {
                    let selectedVariant: any = null
                    let product: any = productItem
                    let optionValueIndex: any =
                      product?.configurable_options?.[0]?.values?.[0]?.value_index

                    if (product?.__typename === "ConfigurableProduct") {
                      selectedVariant = product?.variants.find((variant: any) =>
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
                            const isOutOfStock = stockStatus?.every(
                              (status: any) => status?.stock_status !== "IN_STOCK"
                            )
                            const isOnSale =
                              (product.__typename === "ConfigurableProduct"
                                ? getconfigurablePrice(selectedVariant?.product)
                                : regularPrice(variantProduct)) >
                              (product.__typename === "ConfigurableProduct"
                                ? configurableFinalPrice(selectedVariant?.product)
                                : finalPrice(variantProduct))
                            if (isOutOfStock) {
                              return <div className={styles.saleTag}>Out of Stock</div>
                            } else if (isOnSale) {
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
                            {stockStatus?.some(
                              (status: any) => status?.stock_status === "IN_STOCK"
                            ) ? (
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
                            ) : (
                              <button className={styles.addToCartButton}>
                                {!isMobile ? (
                                  "add to cart"
                                ) : (
                                  <svg
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
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                  </svg>
                                )}
                              </button>
                            )}
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
      {displayedProducts && displayedProducts.length > 0 && !isLoading ? (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
        />
      ) : null}
    </>
  )
}

export default CategoriesProducts