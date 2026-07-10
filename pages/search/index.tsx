"use client"

import styles from "../../styles/Search.module.css"
import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/router"
import SearchProduct from "@/components/Search/SearchProduct"
import { Client } from "@/graphql/client"
import Pagination from "@/components/Category/pagination"
import Head from "next/head"
import Image from "next/image"
import { debounce } from "lodash"

let filterOptions: any = []

function Search() {
  const router = useRouter()
  const client = new Client()
  const [searchInput, setSearchInput] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [searchResults, setSearchResults] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState<any>(1)
  const [aggregations, setAggregations] = useState<any[]>([])
  const [activeFilters, setActiveFilters] = useState<any[]>([])
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({})
  const [filters, setFilters] = useState<any>({})
  const [isFilterOpen, setIsFilterOpen] = useState<any>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasValidAggregations, setHasValidAggregations] = useState<boolean>(false)

  // New states for filter and sort functionality
  const [selectedSortOption, setSelectedSortOption] = useState("")
  const [isSortListHovered, setIsSortListHovered] = useState<any>(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 80000])
  const [highestPrice, setHighestPrice] = useState<number>(0)
  const [lowestPrice, setLowestPrice] = useState<number>(0)
  const [productCount, setProductCount] = useState<any>("")
  const [changeCheckPage, setChangeCheckPage] = useState<any>(false)
  const [displayedProducts, setDisplayedProducts] = useState<any>([])
  const [totalPages, setTotalPages] = useState(1)

// console.log(searchResults,'searchResults')
  // Extract the slug from the router query
  const slug: any = router.query?.query
  const page = Number(router.query?.page) || 1

  // Sync currentPage with the URL parameter
  useEffect(() => {
    setCurrentPage(page)
  }, [page])


  // // Get Aggregation
  // async function FetchAggregation() {
  //   if (currentPage) {
  //     try {
  //       setLoading(true)
  //       const result = await client.fetchProductDetailsAllUrl(currentPage)
  //       setAggregations(result?.data?.products?.aggregations || [])
  //     } catch (error) {
  //       console.error("Error fetching aggregations:", error)
  //       setAggregations([])
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  // }

  // useEffect(() => {
  //   FetchAggregation()
  // }, [currentPage])

  // Setup filter options
  useEffect(() => {
    if (aggregations?.length > 0) {
      filterOptions = aggregations.map((element: any) => ({
        label: element?.label,
        value: getForMatted(element?.label),
      }))
    }
  }, [aggregations])

  // Initialize open groups
  useEffect(() => {
    if (aggregations?.length > 0) {
      const firstGroupLabel = aggregations[0].label
      setOpenGroups({ [firstGroupLabel]: true })
    }
  }, [aggregations])

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

    if (searchResults?.products?.items) {
      calculatePriceRange(searchResults.products.items)
      setDisplayedProducts(searchResults.products.items)
      setProductCount(searchResults.products.total_count || 0)
      setTotalPages(Math.ceil((searchResults.products.total_count || 0) / 21))
    }
  }, [searchResults])

  // Fetch search results based on the slug
  const fetchSearchResults = async () => {
    if (slug) {
      setLoading(true)
      setSearchInput(slug as string)
      try {
        const result = await client.fetchSearchProductResult(slug as string, currentPage)
        setSearchResults(result || null)
         setAggregations(result?.products?.aggregations || [])
      } catch (error) {
        console.error("Error fetching search results:", error)
        setSearchResults(null)
         setAggregations([])
      } finally {
        setLoading(false)
      }
    }
  }

  // Fetch search results whenever slug or currentPage changes
  useEffect(() => {
    if (slug) {
      fetchSearchResults()
    }
  }, [slug, currentPage])

  // Filter and Sorting Logic
  const getForMatted = (str: any) => {
    str = str.replace(/[()]/g, "")
    return str.replaceAll(" ", "_").toLowerCase()
  }

  const applyProductFilter = useCallback(
    debounce(async (filter: any) => {
      if (!slug) return

      setIsLoading(true)
      try {
        // Create filter object WITHOUT search term - only actual filters
        const graphqlFilter: Record<string, { eq?: string; in?: string[]; from?: string; to?: string }> = {}

        // Add filters (excluding search term)
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

        // Call API with search term separate from filter
        // This should generate: search: "rolex", filter: { price: { from: "1000000", to: "2000000" } }
        const response = await client.fetchCategoryFilterProductResult(
          slug, // search term as separate parameter
          currentPage,
          formatObject(graphqlFilter), // filter object without search term
          formatSortObject(sortParam),
        )

        if (response?.products?.items?.length > 0) {
          setSearchResults(response)
          setDisplayedProducts(response.products.items)
          setProductCount(response.products.total_count || 0)
          setTotalPages(Math.ceil((response.products.total_count || 0) / 21))
        } else {
          setDisplayedProducts([])
          setProductCount(0)
          setTotalPages(0)
        }
      } catch (error) {
        console.error("Error applying filters:", error)
        setDisplayedProducts([])
        setProductCount(0)
        setTotalPages(0)
      } finally {
        setIsLoading(false)
      }
    }, 500),
    [currentPage, slug, selectedSortOption, filterOptions],
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
          setActiveFilters((prev) =>
            prev.filter((item) => item.label !== aggregationLabel || item.value !== optionValue),
          )
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
      prev.filter((filter) => !(filter.label === filterToRemove?.label && filter.value === filterToRemove?.value)),
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

  const handleSortOptionClick = (value: string) => {
    setSelectedSortOption(value)
  }

  const handleSortListHover = (isHovered: boolean) => {
    setIsSortListHovered(isHovered)
  }

  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => {
      const isCurrentlyOpen = prev[groupLabel]
      const newState = Object.keys(prev).reduce(
        (acc, key) => {
          acc[key] = false
          return acc
        },
        {} as Record<string, boolean>,
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

  // Handle search input submission
  const handleSearch = () => {
    if (searchInput.trim()) {
      router.push(`/search/?query=${encodeURIComponent(searchInput.trim())}&page=1`)
    }
  }

  // Handle page change for pagination
  const handlePageChange = useCallback(
    debounce((page: number) => {
      window.scrollTo({ top: 0, behavior: "smooth" })
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, page },
        },
        undefined,
        { shallow: true },
      )
      setChangeCheckPage(true)
      setCurrentPage(page)
      if (activeFilters.length > 0 || selectedSortOption) {
        applyProductFilter(filters)
      }
    }, 300),
    [router, activeFilters, filters, selectedSortOption, applyProductFilter],
  )

  // Handle Enter key press for search
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchInput.trim()) {
      router.push(`/search/?query=${encodeURIComponent(searchInput.trim())}&page=1`)
    }
  }

  // Check if any aggregations exist and if the label is not null or 0
  useEffect(() => {
    if (Array.isArray(aggregations) && aggregations.length > 0) {
      const validAggregations = aggregations.some((aggregation: any) => aggregation?.label && aggregation.label !== "0")
      setHasValidAggregations(validAggregations)
    } else {
      setHasValidAggregations(false)
    }
  }, [aggregations])

  // Early return if router is not ready (prevents SSR issues)
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
            {loading ? (
              <p className={styles.textLoading}>Loading...</p>
            ) : (
              <p>
                {productCount
                  ? `Showing result for ${slug}: ${productCount} items`
                  : `No results found for ${slug || "your search"}.`}
              </p>
            )}
          </div>
        </div>

        
          <>
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
              isSortListHovered={isSortListHovered}
              handleSortOptionClick={handleSortOptionClick}
              handleSortListHover={handleSortListHover}
              productCount={productCount}
              setSelectedSortOption={setSelectedSortOption}
              selectedSortOption={selectedSortOption}
              setPriceRange={setPriceRange}
              highestPrice={highestPrice}
              lowestPrice={lowestPrice}
              isLoading={loading}
            />

            {totalPages > 1 && (
              <Pagination totalPages={totalPages} currentPage={currentPage} handlePageChange={handlePageChange} />
            )}
          </>

      </div>
    </>
  )
}

export default Search
