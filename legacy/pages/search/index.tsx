// Search Page:
"use client"

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react"
import styles from "../../styles/Search.module.css"
import { useRouter } from "next/router"
import SearchProduct from "@/components/Search/SearchProduct"
import { Client } from "@/graphql/client"
import Pagination from "@/components/Category/pagination"
import Head from "next/head"
import Image from "next/image"
import { debounce } from "lodash"

let filterOptions: any = []

const productsPerPage = 21

function Search() {
  const router = useRouter()
  const client = useRef(new Client()).current

  // Search
  const [searchInput, setSearchInput] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [changeCheckPage, setChangeCheckPage] = useState<boolean>(false)
  const [totalPages, setTotalPages] = useState<number>(1)

  // Products
  const [displayedProducts, setDisplayedProducts] = useState<any[]>([])
  const [pendingProducts, setPendingProducts] = useState<any[] | null>(null)
  const [productCount, setProductCount] = useState<number>(0)
  const [searchResults, setSearchResults] = useState<any>(null)

  // Filters
  const [aggregations, setAggregations] = useState<any[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 80000])
  const [highestPrice, setHighestPrice] = useState<number>(0)
  const [lowestPrice, setLowestPrice] = useState<number>(0)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [activeFilters, setActiveFilters] = useState<any[]>([])
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [selectedSortOption, setSelectedSortOption] = useState<string>("")
  const [showAllFilters, setShowAllFilters] = useState<Record<string, boolean>>({})
  const [hasValidAggregations, setHasValidAggregations] = useState<boolean>(false)
  const [filtersReady, setFiltersReady] = useState<boolean>(false)

  // Loading / UI
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSortListHovered, setIsSortListHovered] = useState<boolean>(false)
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false)

  // Refs to avoid stale closures
  const filtersRef = useRef(filters)
  const selectedSortOptionRef = useRef(selectedSortOption)
  const activeFiltersRef = useRef(activeFilters)
  const currentPageRef = useRef(currentPage)
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

  const slug: any = router.query?.query
  const pageFromQuery = Number(router.query?.page) || 1

  // Reserve filter column while checking / when valid → no layout shift
  const showFilterColumn = !filtersReady || hasValidAggregations

  useEffect(() => {
    const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 768)
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Sync page from URL
  useEffect(() => {
    const safePage = isNaN(pageFromQuery) ? 1 : Math.max(1, pageFromQuery)
    if (safePage !== currentPage) {
      setCurrentPage(safePage)
    }
  }, [pageFromQuery])

  // Setup filter options from aggregations
  useEffect(() => {
    if (aggregations?.length > 0) {
      filterOptions = aggregations.map((element: any) => ({
        label: element?.label,
        value: element?.attribute_code || getForMatted(element?.label),
      }))
    }
  }, [aggregations])

  // Valid aggregations + open first groups
  useEffect(() => {
    const validAggregations = aggregations?.some(
      (aggregation: any) => aggregation.label && aggregation.label !== "0"
    )
    setHasValidAggregations(!!validAggregations)
    setFiltersReady(true)

    if (aggregations?.length > 0) {
      const initialState: Record<string, boolean> = {}
      aggregations
        .filter(
          (aggregation: any) =>
            aggregation.label !== "Category" &&
            aggregation.label !== "Brand" &&
            (aggregation.label?.toLowerCase() === "price" || aggregation.options?.length > 1)
        )
        .reverse()
        .slice(0, 3)
        .forEach((aggregation: any) => {
          initialState[aggregation.label] = true
        })
      setOpenGroups(initialState)
    }
  }, [aggregations])

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
      if (highestPrice == 0){
      setLowestPrice(adjustedLowest)
      setHighestPrice(adjustedHighest)
      setPriceRange([adjustedLowest, adjustedHighest])}
    }

    if (searchResults?.products?.items) {
      calculatePriceRange(searchResults.products.items)
    }
  }, [searchResults])

  // Apply pending products
  useEffect(() => {
    if (pendingProducts !== null) {
      setDisplayedProducts(pendingProducts)
    }
  }, [pendingProducts])

  const getForMatted = (str: any) => {
    if (!str) return ""
    str = str.replace(/[()]/g, "")
    return str.replaceAll(" ", "_").toLowerCase()
  }

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

  // Initial / page search fetch
  const fetchSearchResults = useCallback(
    async (page: number = currentPage) => {
      if (!slug) return
      setLoading(true)
      setIsLoading(true)
      setSearchInput(slug as string)

      try {
        const result = await client.fetchSearchProductResult(slug as string, page)
        if (result?.products) {
          setSearchResults(result)
          setAggregations(result.products.aggregations || [])
          setPendingProducts(result.products.items || [])
          setProductCount(result.products.total_count || 0)
          setTotalPages(Math.ceil((result.products.total_count || 0) / productsPerPage))
        } else {
          setSearchResults(null)
          setAggregations([])
          setPendingProducts([])
          setProductCount(0)
          setTotalPages(0)
        }
      } catch (error) {
        console.error("Error fetching search results:", error)
        setSearchResults(null)
        setAggregations([])
        setPendingProducts([])
        setProductCount(0)
        setTotalPages(0)
      } finally {
        setLoading(false)
        setIsLoading(false)
      }
    },
    [slug, currentPage, client]
  )

  useEffect(() => {
    if (slug && router.isReady) {
      // Only do plain search when no active filters/sort
      if (activeFiltersRef.current.length === 0 && !selectedSortOptionRef.current) {
        fetchSearchResults(currentPage)
      }
    }
  }, [slug, currentPage, router.isReady])

  // Filter + sort application (mirrors Category page)
  const applyProductFilter = useMemo(() => {
    const debouncedFn = debounce(async (filter: any, page: number, sort: string) => {
      if (!slug || isApplyingFilterRef.current) return
      isApplyingFilterRef.current = true
      setIsLoading(true)

      try {
        const hasFilters = Object.keys(filter).length > 0
        const hasSort = sort && sort !== "none" && sort !== ""

        // No filters/sort → fall back to plain search results
        if (!hasFilters && !hasSort && page === 1) {
          await fetchSearchResults(1)
          isApplyingFilterRef.current = false
          setIsLoading(false)
          return
        }

        const graphqlFilter: Record<string, any> = {}

        for (const key in filter) {
          if (key === "price" && filter[key]) {
            graphqlFilter.price = {
              from: String(filter[key][0]),
              to: String(filter[key][1]),
            }
          } else if (filter[key] && filter[key].length > 0) {
            const filterOption = filterOptions.find((option: any) => option.value === key)
            if (filterOption) {
              let attributeName = filterOption.value || getForMatted(filterOption.label)
              if (attributeName.toLowerCase() === "ring_size") attributeName = "lux_ring_size"
              if (attributeName.toLowerCase() === "metal") attributeName = "metal_type"

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
          slug, // search term
          page,
          formatObject(graphqlFilter),
          formatSortObject(sortParam)
        )

        if (response?.products?.items?.length > 0) {
          setSearchResults(response)
          // setAggregations(response.products.aggregations || aggregations)
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
  }, [client, getSortingParam, slug, fetchSearchResults, aggregations])

  // Trigger filter/sort when they change
  useEffect(() => {
    if (!slug || !router.isReady) return

    if (!changeCheckPage) {
      setCurrentPage(1)
      const newQuery = { ...router.query }
      delete newQuery.page
      router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true })
    }

    setChangeCheckPage(false)
    applyProductFilter(filters, 1, selectedSortOption)
  }, [selectedSortOption, filters, slug])

  // Cleanup debounce
  useEffect(() => {
    return () => {
      applyProductFilter.cancel()
    }
  }, [applyProductFilter])

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

  // Dual-range price handler (same as Category)
  const handlePriceRangeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const value = Number(event.target.value)

      setPriceRange((prev) => {
        let min = prev[0]
        let max = prev[1]

        if (index === 0) {
          min = Math.min(value, max)
        } else {
          max = Math.max(value, min)
        }

        const newRange: [number, number] = [min, max]

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
        fetchSearchResults(page)
      }
    },
    [router, totalPages, currentPage, applyProductFilter, fetchSearchResults]
  )

  const handleSearch = () => {
    if (searchInput.trim()) {
      // Reset filters when doing a new search
      setFilters({})
      setActiveFilters([])
      setAggregations([])
      setSelectedSortOption("")
      router.push(`/search/?query=${encodeURIComponent(searchInput.trim())}&page=1`)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchInput.trim()) {
      setFilters({})
      setActiveFilters([])
      setSelectedSortOption("")
      router.push(`/search/?query=${encodeURIComponent(searchInput.trim())}&page=1`)
    }
  }

  if (!router.isReady) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Head>
        <title>{`Search results for ${slug || "products"} - Headora`}</title>
        <meta
          name="description"
          content={`Find the best products for ${slug || "your search"} in our store. Shop now from a wide variety of products.`}
        />
        <meta name="keywords" content={`search, ${slug || "products"}, products, brands`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`Search results for ${slug || "products"} - Headora`} />
        <meta
          property="og:description"
          content={`Explore a wide range of products related to ${slug || "your search"}. Discover the best deals today.`}
        />
        <meta
          property="og:url"
          content={`${process.env.baseURL}search?query=${encodeURIComponent((slug as string) || "")}`}
        />
        <meta property="og:site_name" content="Headora" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Search results for ${slug || "products"} - Headora`} />
        <meta
          name="twitter:description"
          content={`Explore products related to ${slug || "your search"} on Headora. Get the best offers now.`}
        />
      </Head>

      <div className={styles.navBarSpace}></div>
      <div className={styles.SearchPageMainContainer}>
        <div className={styles.headerContainer}>
          <div className={styles.searchContainer}>
            <Image
              src="/Images/SearchIcon.png"
              alt="SearchIcon"
              width={35}
              height={25}
              style={{ filter: "invert()", paddingRight: "10px" }}
            />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search for products, brands, and more..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className={styles.searchButton} onClick={handleSearch}>
              Search
            </button>
          </div>
          <div className={styles.resultCount}>
            {loading || isLoading ? (
              <p className={styles.textLoading}>Loading...</p>
            ) : (
              <p>
                {productCount
                  ? `Showing result for "${slug}": ${productCount} items`
                  : `No results found for ${slug || "your search"}.`}
              </p>
            )}
          </div>
        </div>

        <SearchProduct
          productsData={displayedProducts || []}
          aggrations={aggregations}
          toggleGroup={toggleGroup}
          openGroups={openGroups}
          handleCheckboxChange={handleCheckboxChange}
          handleFilterClick={handleFilterClick}
          isFilterOpen={isFilterOpen}
          isChecked={isChecked}
          filters={filters}
          filterOptions={filterOptions}
          setIsFilterOpen={setIsFilterOpen}
          activeFilters={activeFilters}
          handleRemoveFilter={handleRemoveFilter}
          setFilters={setFilters}
          setActiveFilters={setActiveFilters}
          hasValidAggregations={hasValidAggregations}
          showFilterColumn={showFilterColumn}
          isSortListHovered={isSortListHovered}
          handleSortOptionClick={handleSortOptionClick}
          handleSortListHover={handleSortListHover}
          productCount={productCount}
          setSelectedSortOption={setSelectedSortOption}
          selectedSortOption={selectedSortOption}
          setPriceRange={setPriceRange}
          highestPrice={highestPrice}
          lowestPrice={lowestPrice}
          priceRange={priceRange}
          handlePriceRangeChange={handlePriceRangeChange}
          isLoading={isLoading || loading}
          showAllFilters={showAllFilters}
          setShowAllFilters={setShowAllFilters}
        />

        {displayedProducts && displayedProducts.length > 0 && !isLoading && totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
          />
        )}
      </div>
    </>
  )
}

export default Search