"use client"

import React, { useEffect, useState, useCallback } from "react"
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

function CategoriesProducts({ productsData, categoriesData, categoryDetail, showRibbon, isMobile }: any) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<any>(1)
  const [changeCheckPage, setChangeCheckPage] = useState<any>(false)
  const [displayedProducts, setDisplayedProducts] = useState<any>(productsData || [])
  const [pendingProducts, setPendingProducts] = useState<any>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState<any>(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 80000])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [highestPrice, setHighestPrice] = useState<number>(0)
  const [lowestPrice, setLowestPrice] = useState<number>(0)
  const [addToLoading, setAddToLoading] = useState<any>(false)
  const [showModal, setShowModal] = useState<any>(false)
  const [modalHeading, setModalHeading] = useState<any>("")
  const [modalMessage, setModalMessage] = useState<any>("")
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<any>({})
  const [productCount, setProductCount] = useState<any>("")
  const [isSortListHovered, setIsSortListHovered] = useState<any>(false)
  const [activeSortField, setActiveSortField] = useState<any>("")
  const [filters, setFilters] = useState<any>({})
  const [selectedSortOption, setSelectedSortOption] = useState("")
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false)
  const [activeFilters, setActiveFilters] = useState<any[]>([])
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({})
  const [stockStatus, setStockStatus] = useState<any>(null)
  const [loadingStockStatus, setLoadingStockStatus] = useState(true)
  const [hasValidAggregations, setHasValidAggregations] = useState<boolean>(false)
  const [wishlistLoading, setWishlistLoading] = useState<{ [key: string]: boolean }>({})
  const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(null)
  const [wishlistId, setWishlistId] = useState<any>(null)
  const [wishlistItems, setWishlistItems] = useState<any>({})
  const [wishlistItemsLoading, setWishlistItemsLoading] = useState<boolean>(false)
  const [wishlistItemIds, setWishlistItemIds] = useState<{ [productId: string]: number }>({})
  const client = new Client()

  // Wishlist Functionality
  const syncWishlistItems = useCallback(async () => {
    if (!userLoggedIn) return
    try {
      const wishlistData = await client.fetchWishListProductsList()
      if (wishlistData?.data?.customer?.wishlists?.length > 0) {
        const wishlist = wishlistData.data.customer.wishlists[0]
        const wishlistProducts = wishlist.items_v2?.items || []
        const wishlistSkuMap: { [sku: string]: boolean } = {}
        const wishlistSkuToItemIdMap: { [sku: string]: number } = {}
        wishlistProducts.forEach((item: any) => {
          if (item.product?.sku) {
            wishlistSkuMap[item.product.sku] = true
            wishlistSkuToItemIdMap[item.product.sku] = item.id
          }
        })
        const updatedWishlistItems: { [productId: string]: boolean } = {}
        const updatedWishlistItemIds: { [productId: string]: number } = {}
        displayedProducts.forEach((productItem: any) => {
          const product = productItem
          let variantProduct = product
          if (product?.__typename === "ConfigurableProduct") {
            const optionValueIndex = product?.configurable_options?.[0]?.values?.[0]?.value_index
            const selectedVariant = product?.variants.find((variant: any) =>
              variant.attributes.some((attribute: any) => attribute.value_index === optionValueIndex),
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
  }, [userLoggedIn, displayedProducts])

  const checkUserLogin = useCallback(async () => {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      console.log("Skipping user sync on localhost")
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
  }, [])

  const handleWishlist = useCallback(
    async (productSku: string, productId: string) => {
      setWishlistLoading((prev) => ({ ...prev, [productId]: true }))
      try {
        if (userLoggedIn === null) await checkUserLogin()
        if (!userLoggedIn) {
          router.push("/customer/account/login/")
          return
        }
        if (!wishlistId) await fetchWishlistId()
        if (wishlistId) {
          const result = await client.fetchWishlistMutation(productSku, wishlistId)
          if (result?.data?.addProductsToWishlist?.wishlist) {
            setModalHeading("Success!")
            setModalMessage("Product added to wishlist successfully!")
            setShowModal(true)
            setTimeout(() => setShowModal(false), 4000)
            setWishlistItems((prev: any) => ({ ...prev, [productId]: true }))
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
    [userLoggedIn, wishlistId, checkUserLogin, fetchWishlistId, router]
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
    [wishlistId, wishlistItems, syncWishlistItems]
  )

  useEffect(() => {
    checkUserLogin()
  }, [checkUserLogin])

  useEffect(() => {
    if (userLoggedIn && displayedProducts.length > 0) {
      syncWishlistItems()
    }
  }, [userLoggedIn, displayedProducts, syncWishlistItems, showRibbon])

  // Fetch stock status
  const fetchStockData = useCallback(async () => {
    setLoadingStockStatus(true)
    try {
      const data = await client.fetchCategoryProductsStockStatus(categoryDetail.url_key, currentPage)
      if (data) {
        setStockStatus(data?.data?.categoryList?.[0]?.products.items)
      }
    } catch (err) {
      console.error("Error fetching stock data:", err)
    } finally {
      setLoadingStockStatus(false)
    }
  }, [categoryDetail, currentPage])

  // console.log("TEST")

  useEffect(() => {
    fetchStockData()
  }, [fetchStockData])



  // Fetch form key
  const fetchFormKey = async () => {
    try {
      const response = await fetch(`${process.env.baseURL}fcprofile/sync/index`, {
        method: "GET",
      })
      if (!response.ok) throw new Error(`Error fetching form key: ${response.statusText}`)
      const data = await response.json()
      if (data) {
        setCookie("form_key", data.form_key, 1)
        return data.form_key
      }
      throw new Error("Form key not found in the response.")
    } catch (error) {
      console.error("Error fetching form key:", error)
      return null
    }
  }

  const setCookie = (name: any, value: any, days: any) => {
    let expires = ""
    if (days) {
      const date = new Date()
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
      expires = "; expires=" + date.toUTCString()
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/"
  }

  const getCookie = (name: any) => {
    const nameEQ = name + "="
    const ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  const handleAddToCart = useCallback(
    async (productId: any, quantity: any) => {
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
            result.errors?.general_exception
              ? result.errors.general_exception[0]?.message
              : result.message || "Something went wrong... Please try again later."
          )
          setShowModal(true)
        }
      } catch (error) {
        setModalHeading("Oops!")
        setModalMessage("Error adding to cart: " + (error instanceof Error ? error.message : "Unknown error"))
        setShowModal(true)
      } finally {
        setAddToLoading(false)
      }
    },
    [fetchFormKey]
  )

  // Fetch products for a specific page
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
          setTotalPages(Math.ceil((response.categoryList[0].products.total_count || 0) / productsPerPage))
        } else {
          setPendingProducts([])
          setProductCount(0)
          setTotalPages(0)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        if (page === 1 && !activeFilters.length) {
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
    [categoryDetail, productsData, categoriesData, activeFilters]
  )

  // Update displayed products when pending products change
  useEffect(() => {
    if (pendingProducts !== null) {
      setDisplayedProducts(pendingProducts)
    }
  }, [pendingProducts])

  // Calculate price range
  useEffect(() => {
    const calculatePriceRange = (products: any[]) => {
      if (products.length === 0) {
        setHighestPrice(0)
        setLowestPrice(0)
        return
      }
      const prices = products.map((product) => {
        return (
          product?.price?.regularPrice?.amount?.value ??
          product?.variants?.[0]?.product?.price_range?.maximum_price?.final_price?.value ??
          0
        )
      })
      const highest = Math.round(Math.max(...prices) / 10) * 10
      const lowest = Math.round(Math.min(...prices) / 10) * 10
      setHighestPrice(highest)
      setLowestPrice(lowest)
    }
    calculatePriceRange(productsData)
  }, [productsData])

  // Handle page and filter changes
  useEffect(() => {
    const pageFromQuery = router.query.page ? Number.parseInt(router.query.page as string, 10) : 1
    const safePage = pageFromQuery > totalPages ? 1 : pageFromQuery
    setCurrentPage(safePage)
    if (activeFilters.length > 0 || selectedSortOption) {
      applyProductFilter(filters)
    } else if (safePage !== 1) {
      fetchProductsForPage(safePage)
    } else {
      setPendingProducts(productsData)
      setProductCount(categoriesData?.products?.total_count || 0)
      setTotalPages(Math.ceil((categoriesData?.products?.total_count || 0) / productsPerPage))
    }
  }, [router.query, productsData, categoriesData, activeFilters, selectedSortOption, fetchProductsForPage])

  // Breadcrumbs management
  const { slug, slug2, slug3, ...rest } = router.query
  const slugs = [slug, slug2, slug3, ...Object.values(rest)].filter(Boolean)
  const breadcrumbs = [
    { name: "Home", path: "/" },
    ...slugs.map((slugPart: any, index) => ({
      name: slugPart.replace(/-/g, " "),
      path: `/${slugs.slice(0, index + 1).join("/")}`,
    })),
  ]

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("breadcrumbs", JSON.stringify(breadcrumbs))
    }
  }, [router.query])

  // Filter and Sorting Logic
  const getForMatted = (str: any) => {
    str = str.replace(/[()]/g, "")
    return str.replaceAll(" ", "_").toLowerCase()
  }

  if (categoriesData?.products.aggregations) {
    filterOptions = categoriesData.products.aggregations.map((element: any) => ({
      label: element?.label,
      value: getForMatted(element?.label),
    }))
  }

  useEffect(() => {
    setSelectedOptions({})
  }, [])

  const applyProductFilter = useCallback(
    debounce(async (filter: any) => {
      setIsLoading(true)
      try {
        const graphqlFilter: Record<string, { eq?: string; in?: string[]; from?: string; to?: string }> = {
          category_uid: { eq: categoryDetail?.uid }
        }
        for (const key in filter) {
          if (filter[key] && filter[key].length > 0) {
            const filterOption = filterOptions.find((option: any) => option.value === key)
            if (filterOption) {
              let attributeName: any = getForMatted(filterOption.label)
              if (attributeName.toLowerCase() === "ring_size") {
                attributeName = "lux_ring_size"
              } else if (attributeName.toLowerCase() === "metal") {
                attributeName = "metal_type"
              }
              if (attributeName.toLowerCase() === "price") {
                const priceRanges = filter[key]
                  .map((range: string) => {
                    const [from, to] = range.split("_").map(Number)
                    if (!isNaN(from) && !isNaN(to)) {
                      return { from, to }
                    }
                    return null
                  })
                  .filter(Boolean)
                if (priceRanges.length > 0) {
                  const minFrom = Math.min(...priceRanges.map((r: any) => r!.from))
                  const maxTo = Math.max(...priceRanges.map((r: any) => r!.to))
                  graphqlFilter.price = {
                    from: String(minFrom),
                    to: String(maxTo),
                  }
                }
              } else {
                graphqlFilter[attributeName] = filter[key].length === 1 ? { eq: filter[key][0] } : { in: filter[key] }
              }
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
        const sortParam = selectedSortOption ? getSortingParam(selectedSortOption) : {}
        const response = await client.fetchCategoryFilterProductResult(
          "",
          currentPage,
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
      }
    }, 500),
    [currentPage, categoryDetail, selectedSortOption]
  )

  const getSortingParam = (selectedSortOption: string): Record<string, string> => {
    switch (selectedSortOption) {
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
  }

  useEffect(() => {
    if (selectedSortOption || Object.keys(filters).length > 0) {
      changeCheckPage ? null : setCurrentPage(1)
      setChangeCheckPage(false)
      applyProductFilter(filters)
    }
  }, [selectedSortOption, filters, applyProductFilter, changeCheckPage])

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label)
  }

  const closeDropDown = () => {
    setOpenDropdown(null)
  }

  const handleCheckboxChange = (aggregationLabel: string, optionValue: string, isChecked: boolean) => {
    const filter: { [key: string]: string[] } = { ...filters }
    filterOptions.forEach((option: any) => {
      if (option.label === aggregationLabel) {
        const key = option.value
        if (!filter[key]) filter[key] = []
        if (isChecked) {
          setActiveFilters((prev) => [...prev, { label: aggregationLabel, value: optionValue }])
          if (!filter[key].includes(optionValue)) filter[key].push(optionValue)
        } else {
          setActiveFilters((prev) => prev.filter((item) => item.label !== aggregationLabel || item.value !== optionValue))
          filter[key] = filter[key].filter((value) => value !== optionValue)
          if (filter[key].length === 0) delete filter[key]
        }
      }
    })
    setFilters(filter)
    applyProductFilter(filter)
  }

  const handleRemoveFilter = (filterToRemove: any) => {
    setActiveFilters((prev) =>
      prev.filter((filter) => !(filter.label === filterToRemove?.label && filter.value === filterToRemove?.value))
    )
    const updatedFilters = { ...filters }
    filterOptions.forEach((option: any) => {
      if (option?.label === filterToRemove?.label) {
        const key = option.value
        if (updatedFilters[key]) {
          updatedFilters[key] = updatedFilters[key].filter((val: string) => val !== filterToRemove.value)
          if (updatedFilters[key].length === 0) delete updatedFilters[key]
        }
      }
    })
    setFilters(updatedFilters)
    applyProductFilter(updatedFilters)
  }

  const updateUrlWithFilters = (filters: any) => {
    const query = { ...router.query }
    Object.keys(filters).forEach((filterKey) => {
      if (filters[filterKey].length > 0) {
        query[filterKey] = filters[filterKey].join(",")
      } else {
        delete query[filterKey]
      }
    })
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true })
  }

  const handleSortOptionClick = (value: string) => {
    setActiveSortField(value)
    setSelectedSortOption(value)
  }

  const handleSortListHover = (isHovered: boolean) => {
    setIsSortListHovered(isHovered)
  }

  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  useEffect(() => {
    const validAggregations = categoriesData?.products?.aggregations?.some(
      (aggregation: any) => aggregation.label && aggregation.label !== "0"
    )
    setHasValidAggregations(validAggregations)
  }, [categoriesData])

  useEffect(() => {
    if (categoriesData?.products?.aggregations?.length > 0) {
      const firstGroupLabel = categoriesData.products.aggregations[0].label
      setOpenGroups({ [firstGroupLabel]: true })
    }
  }, [categoriesData])

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => {
      const isCurrentlyOpen = prev[groupLabel]
      const newState = Object.keys(prev).reduce(
        (acc, key) => {
          acc[key] = false
          return acc
        },
        {} as Record<string, boolean>
      )
      if (!isCurrentlyOpen) newState[groupLabel] = true
      return newState
    })
  }

  const isChecked = (label: any, value: any) => {
    let key = ""
    for (let i = 0; i < filterOptions.length; i++) {
      if (filterOptions[i].label === label) {
        key = filterOptions[i].value
      }
    }
    return filters[key]?.includes(value) || false
  }

  const handlePriceChange = (newPriceRange: [number, number]) => {
    setPriceRange(newPriceRange)
    applyProductFilter({ ...filters, price: newPriceRange })
  }

  const regularPrice = (item: any) => {
    const final_price = item?.price_range?.maximum_price?.final_price?.value.toLocaleString()
    const regular_price = item?.price_range?.maximum_price?.regular_price?.value.toLocaleString()
    const currency: any = item?.price?.regularPrice?.amount?.currency
    if (regular_price !== final_price) {
      return `${Currency[currency]}${regular_price}`
    }
    return ""
  }

  const finalPrice = (item: any) => {
    const final_price = item?.price_range?.maximum_price?.final_price?.value.toLocaleString()
    const currency: any = item?.price?.regularPrice?.amount?.currency
    return `${Currency[currency]}${final_price}`
  }

  const getconfigurablePrice = (item: any) => {
    const price = item?.price_range?.maximum_price?.regular_price?.value?.toLocaleString()
    const regular_price = item?.price_range?.maximum_price?.regular_price?.value?.toLocaleString()
    const currency: any = item?.price_range?.maximum_price?.regular_price?.currency
    if (regular_price !== price) {
      return `${Currency[currency]} ${price}`
    }
    return ""
  }

  const configurableFinalPrice = (item: any) => {
    const final_price = item?.price_range?.maximum_price?.final_price?.value.toLocaleString()
    const currency: any = item?.price_range?.maximum_price?.regular_price?.currency
    return `${Currency[currency]}${final_price}`
  }

  // Handle page change
  const handlePageChange = useCallback(
    debounce((page: number) => {
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
      if (activeFilters.length > 0 || selectedSortOption) {
        applyProductFilter(filters)
      } else if (page !== currentPage) {
        fetchProductsForPage(page)
      }
    }, 300),
    [router, activeFilters, filters, currentPage, selectedSortOption, applyProductFilter, fetchProductsForPage]
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
        />
      )}

      <div className={styles.allProductContainer}>
        {hasValidAggregations && (
          <div className={styles.filterContainer}>
            <div className={styles.filterModal} style={{ zIndex: "unset" }}>
              <div className={styles.filterHeader}>
                <h4>Filter By</h4>
              </div>
              <div className={styles.filterContent}>
                <div className={styles.filterGroup} style={{ borderBottom: activeFilters.length === 0 ? "none" : "" }}>
                  <div className={styles.filterLabelContainer} style={{ padding: activeFilters.length === 0 ? "0" : "" }}>
                    {activeFilters.map((filter: any, index: any) => {
                      const label = categoriesData?.products?.aggregations
                        ?.flatMap((aggregation: any) => aggregation.options)
                        .find((option: any) => option.value === filter.value)?.label
                      return (
                        <span key={index} className={styles.filterGroupLabel}>
                          {filter.label}: {label || "Unknown"}
                          <button className="remove-filter" onClick={() => handleRemoveFilter(filter)}>
                            ×
                          </button>
                        </span>
                      )
                    })}
                  </div>
                </div>
                {categoriesData?.products?.aggregations
                  .filter((aggregation: any) => aggregation.label !== "Category" && aggregation.label !== "Brand")
                  .map((aggregation: any) => (
                    <div key={aggregation.label} className={styles.filterGroup}>
                      <h5 className={styles.filterGroupTitle} onClick={() => toggleGroup(aggregation.label)}>
                        {aggregation.label.replace(/_/g, " ")}
                        <span className={styles.dropdownArrow}>
                          {openGroups[aggregation.label] ? (
                            <Image src="/Images/up-arrow.png" alt="Up Arrow" height={10} width={10} />
                          ) : (
                            <Image src="/Images/down-arrow.png" alt="Down Arrow" height={10} width={10} />
                          )}
                        </span>
                      </h5>

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

        <div style={{ margin: "auto" }} className={hasValidAggregations ? styles.products : styles.productsFullWidth}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Image src={'/Images/animatedlogo.gif'} alt="anmated logo" height={39} width={39} style={{ marginRight: '5px' }} />
              <div className={styles.loader}></div>
            </div>
          ) : (
            <>
              {displayedProducts && displayedProducts.length > 0 ? (
                <div className={hasValidAggregations ? styles.watchGrid : styles.watch}>
                  {displayedProducts.map((productItem: any, index: number) => {
                    let selectedVariant: any = null
                    let product: any = productItem
                    let optionValueIndex: any = product?.configurable_options?.[0]?.values?.[0]?.value_index

                    if (product?.__typename === "ConfigurableProduct") {
                      selectedVariant = product?.variants.find((variant: any) =>
                        variant.attributes.some((attribute: any) => attribute.value_index === optionValueIndex),
                      )
                    }

                    const variantProduct = selectedVariant?.product || product

                    return (
                      <React.Fragment key={index}>
                        {/* ---- Main Product Item ---- */}
                        <Link href={`/${product.url_key}.html`} key={variantProduct.id} className={styles.watchItem}>
                          {(() => {
                            const isOutOfStock = stockStatus?.every((status: any) => status?.stock_status !== "IN_STOCK")
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
                                  ? variantProduct.media_gallery[0].url.replace(/\/cache\/.*?\//, "/")
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
                            {manufacturer.find((c) => c.value === String(product?.manufacturer))?.["data-title"] || ""}
                          </p>
                          <span style={{ textDecoration: "none" }}>{variantProduct.name}</span>
                          <p className={styles.conditionName}>
                            {conditions.find((c) => c.value === String(product?.condition))?.["data-title"] || ""}
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

                          {!isMobile && (
                            <div className={styles.actionContainer}>
                              {stockStatus?.some((status: any) => status?.stock_status === "IN_STOCK") ? (
                                <button
                                  className={styles.addToCartButton}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    console.log("product", product)
                                    if (product.__typename === "ConfigurableProduct") {
                                      router.push(`/${product.url_key}.html`)
                                    } else {
                                      handleAddToCart(productItem.id, 1)
                                    }
                                  }}
                                >
                                  add to cart
                                </button>
                              ) : (
                                <button className={styles.addToCartButton} disabled>
                                  add to cart
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
                                <Image src="/Images/BlackHeart.png" height={24} width={27} alt="wishlist icon" />
                              </button>
                            )}
                            </div>
                          )}

                     
                          
                      
                        </Link>

                        {/* ---- Insert Banner After 2nd Product (Index 2 = 3rd Position) ---- */}
                        {index === 2 && isMobile == true && (
                          <div className={styles.smallBannerWrapper}>
                            <Image
                              src={categoryDetail.image ? categoryDetail.image : "/Images/miniBanner.jpg"}
                              alt="Small Promo Banner"
                              width={250}
                              height={500}
                              className={styles.smallBannerImage}
                            />
                          </div>
                        )}
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
      {displayedProducts && displayedProducts.length > 0 ? (
        <Pagination totalPages={totalPages} currentPage={currentPage} handlePageChange={handlePageChange} />
      ) : null}
    </>
  )
}

export default CategoriesProducts