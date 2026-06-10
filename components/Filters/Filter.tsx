import { useEffect, useState, useCallback } from "react"
import styles from "../../styles/Categories.module.css"
import Image from "next/image"

interface FilterProps {
  isSortListHovered: boolean
  handleCheckboxChange: (label: string, value: string, checked: boolean) => void
  handleFilterClick: () => void
  handleSortOptionClick: (value: string) => void
  handleSortListHover: (isHovered: boolean) => void
  categoriesData: any
  productCount: number
  isFilterOpen: boolean
  filters: Record<string, any>
  filterOptions: any[]
  selectedSortOption: string
  setSelectedSortOption: (value: string) => void
  setIsFilterOpen: (value: boolean) => void
  activeFilters: any[]
  handleRemoveFilter: (filter: any) => void
  setPriceRange: (range: [number, number]) => void
  highestPrice: number
  lowestPrice: number
  setFilters: (filters: any) => void
  setActiveFilters: (filters: any[]) => void
  handlePriceRangeChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void
  Currency: Record<string, string>
  priceRange: [number, number]
}

const Filter: React.FC<FilterProps> = ({
  isSortListHovered,
  handleCheckboxChange,
  handleFilterClick,
  handleSortOptionClick,
  handleSortListHover,
  categoriesData,
  productCount,
  isFilterOpen,
  filters,
  filterOptions,
  selectedSortOption,
  setSelectedSortOption,
  setIsFilterOpen,
  activeFilters,
  handleRemoveFilter,
  setPriceRange,
  highestPrice,
  lowestPrice,
  setFilters,
  setActiveFilters,
  handlePriceRangeChange,
  Currency,
  priceRange,
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  const toggleMobileSort = useCallback(() => {
    setIsMobileSortOpen((prev) => !prev)
  }, [])

  const closeMobileSort = useCallback(() => {
    setIsMobileSortOpen(false)
  }, [])

  const visibleAggregations = categoriesData?.products?.aggregations?.filter(
    (aggregation: any) =>
      aggregation.label !== "Category" && aggregation.label !== "Lead Time"
  ) || []

  const displayedAggregations = showMoreFilters
    ? visibleAggregations
    : visibleAggregations.slice(0, 5)

  const isChecked = useCallback((label: string, value: string) => {
    const option = filterOptions?.find((opt: any) => opt.label === label)
    if (!option) return false
    return filters[option.value]?.includes(value) || false
  }, [filterOptions, filters])

  const handleSortChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSelectedSortOption(value)
    handleSortOptionClick(value)
    setIsSortDropdownOpen(false);
  }, [setSelectedSortOption, handleSortOptionClick])



  const handleCloseFilterModal = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).classList.contains(styles.filterOverlayOpen)) {
      handleFilterClick()
    }
  }, [handleFilterClick, styles.filterOverlayOpen])

  // Open first group by default
  useEffect(() => {
    if (categoriesData?.products?.aggregations?.length > 0) {
      const firstGroupLabel = categoriesData.products.aggregations[0].label
      setOpenGroups({ [firstGroupLabel]: true })
    }
  }, [categoriesData])

  const toggleGroup = useCallback((groupLabel: string) => {
    setOpenGroups((prev) => {
      const isCurrentlyOpen = prev[groupLabel]
      const newState: Record<string, boolean> = {}
      
      Object.keys(prev).forEach((key) => {
        newState[key] = false
      })
      
      if (!isCurrentlyOpen) {
        newState[groupLabel] = true
      }
      
      return newState
    })
  }, [])

  return (
    <>
      <div className={styles.sortContainer}>
        <div className={styles.filterDesktopButton}>
          <button onClick={handleFilterClick}>
            Filter
            <Image
              style={{ cursor: "pointer", marginLeft: "8px" }}
              src="/Images/filter.png"
              alt="Show More"
              width={23}
              height={25}
            />
          </button>
        </div>
        <div className={styles.sortInerContent}>
          <span className={`${styles.lightSpan} ${styles.borderRight}`}>
            {productCount} Results
          </span>

          
          <div className={styles.updatedSortList}>
  <div
    className={styles.updatedSortButton}
    onClick={() =>
      setIsSortDropdownOpen(!isSortDropdownOpen)
    }
  >
    <span>
      {selectedSortOption === "priceHighToLow"
        ? "Sort by: Price High to Low"
        : selectedSortOption === "priceLowToHigh"
        ? "Sort by: Price Low to High"
        : selectedSortOption === "productNameAtoZ"
        ? "Sort by: Product Name A-Z"
        : selectedSortOption === "productNameZtoA"
        ? "Sort by: Product Name Z-A"
        : selectedSortOption === "brand"
        ? "Sort by: Brand"
        : selectedSortOption === "position"
        ? "Sort by: Position"
        : "Sort By: Position"}
    </span>

    <div
      className={`${styles.updatedArrow} ${
        isSortDropdownOpen
          ? styles.updatedArrowRotate
          : ""
      }`}
    >
      <Image
        src="/Images/down-arrow.png"
        alt="Sort"
        width={14}
        height={14}
      />
    </div>
  </div>

  {isSortDropdownOpen && (
    <div className={styles.updatedSortDropdown}>
      <ul>
        {/* <li className={styles.updatedSortOption}>
          <label
            className={
              selectedSortOption === "brand"
                ? styles.updatedActive
                : ""
            }
          >
            <input
              type="checkbox"
              value="brand"
              checked={selectedSortOption === "brand"}
              onChange={handleSortChange}
              className={styles.updatedCheckbox}
            />

            <span>Brand</span>
          </label>
        </li> */}

        <li className={styles.updatedSortOption}>
          <label
            className={
              selectedSortOption === "position"
                ? styles.updatedActive
                : ""
            }
          >
            <input
              type="checkbox"
              value="position"
              checked={selectedSortOption === "position"}
              onChange={handleSortChange}
              className={styles.updatedCheckbox}
            />

            <span>Position</span>
          </label>
        </li>

        <li className={styles.updatedSortOption}>
          <label
            className={
              selectedSortOption === "priceHighToLow"
                ? styles.updatedActive
                : ""
            }
          >
            <input
              type="checkbox"
              value="priceHighToLow"
              checked={
                selectedSortOption === "priceHighToLow"
              }
              onChange={handleSortChange}
              className={styles.updatedCheckbox}
            />

            <span>Price: High to Low</span>
          </label>
        </li>

        <li className={styles.updatedSortOption}>
          <label
            className={
              selectedSortOption === "priceLowToHigh"
                ? styles.updatedActive
                : ""
            }
          >
            <input
              type="checkbox"
              value="priceLowToHigh"
              checked={
                selectedSortOption === "priceLowToHigh"
              }
              onChange={handleSortChange}
              className={styles.updatedCheckbox}
            />

            <span>Price: Low to High</span>
          </label>
        </li>

        <li className={styles.updatedSortOption}>
          <label
            className={
              selectedSortOption === "productNameAtoZ"
                ? styles.updatedActive
                : ""
            }
          >
            <input
              type="checkbox"
              value="productNameAtoZ"
              checked={
                selectedSortOption === "productNameAtoZ"
              }
              onChange={handleSortChange}
              className={styles.updatedCheckbox}
            />

            <span>Product Name A-Z</span>
          </label>
        </li>

        <li className={styles.updatedSortOption}>
          <label
            className={
              selectedSortOption === "productNameZtoA"
                ? styles.updatedActive
                : ""
            }
          >
            <input
              type="checkbox"
              value="productNameZtoA"
              checked={
                selectedSortOption === "productNameZtoA"
              }
              onChange={handleSortChange}
              className={styles.updatedCheckbox}
            />

            <span>Product Name Z-A</span>
          </label>
        </li>
      </ul>
    </div>
  )}
</div>
        </div>
      </div>

      {/* Mobile Filter Navbar */}
      <div className={styles.MobileFilterSortContainer}>
        <div className={styles.MobileProductCount}>
          <p>
            <strong>Total Products</strong>
            <br />
            {productCount}
          </p>
        </div>
        <div className={styles.MobileFilterNavbar}>
          <div className={styles.MobileFilterNavbarItem}>
            <button onClick={handleFilterClick}>FILTER BY</button>
          </div>
          <div className={styles.MobileFilterNavbarItem}>
            <button onClick={toggleMobileSort}>SORT BY</button>
          </div>
        </div>
      </div>

      {/* Mobile Sort Options */}
      {isMobileSortOpen && (
        <div className={styles.filterModal} style={{ width: "100%", zIndex: 1 }}>
          <div className={styles.filterHeader}>
            <h4>Sort By</h4>
            <button
              onClick={closeMobileSort}
              className={styles.closeFilterButton}
            >
              &times;
            </button>
          </div>
          <div className={styles.mobileSortDropdown}>
            <ul className={styles.dropdownMenu}>
              {[
                { value: "priceHighToLow", label: "Price: High to Low" },
                { value: "priceLowToHigh", label: "Price: Low to High" },
                { value: "productNameAtoZ", label: "Product Name: (A to Z)" },
                { value: "productNameZtoA", label: "Product Name: (Z to A)" },
                { value: "none", label: "Default" },
              ].map((option) => (
                <li key={option.value} className={styles.sortOption}>
                  <label
                    className={
                      selectedSortOption === option.value ? styles.active : ""
                    }
                  >
                    <input
                      type="checkbox"
                      name="sortOption"
                      value={option.value}
                      checked={selectedSortOption === option.value}
                      onChange={handleSortChange}
                      className={styles.customCheckbox}
                    />
                    {option.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <div
        className={isFilterOpen ? styles.filterOverlayOpen : styles.filterOverlay}
        onClick={handleCloseFilterModal}
      >
        <div className={styles.filterModal} style={{ zIndex: "unset" }}>
          <div className={styles.filterHeader}>
            <h4>Filter By</h4>
          </div>

          <div className={styles.filterContent}>
            <div
              className={styles.filterGroup}
              style={{
                borderBottom: activeFilters.length === 0 ? "none" : undefined,
              }}
            >
              <div 
                className={styles.filterLabelContainer} 
                style={{ padding: activeFilters.length === 0 ? "0" : undefined }}
              >
                {activeFilters
                  .filter((filter: any) => filter.label !== "Price")
                  .map((filter: any, index: number) => {
                    const label = categoriesData?.products?.aggregations
                      ?.flatMap((aggregation: any) => aggregation.options)
                      .find((option: any) => option.value === filter.value)?.label
                    return (
                      <span key={index} className={styles.filterGroupLabel}>
                        {`${filter.label}: ${label || "Unknown"}`}
                        <button 
                          className="remove-filter" 
                          onClick={() => handleRemoveFilter(filter)}
                          style={{ marginLeft: "8px", cursor: "pointer" }}
                        >
                          ×
                        </button>
                      </span>
                    )
                  })}
              </div>
            </div>

            {categoriesData?.products?.aggregations
              ?.filter((aggregation: any) => 
                aggregation.label !== "Category" && aggregation.label !== "Brand"
              )
              .map((aggregation: any) => (
                <div key={aggregation.label} className={styles.filterGroup}>
                  <h5 
                    className={styles.filterGroupTitle} 
                    onClick={() => toggleGroup(aggregation.label)}
                    style={{ cursor: "pointer" }}
                  >
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
                    aggregation.label.toLowerCase() === "price" ? (
                      <div className={styles.priceSliderContainer}>
                        <div className={styles.priceRangeLabels}>
                          <span>
                            {Currency?.USD}{priceRange?.[0] ?? 0}
                          </span>
                          <span>
                            {Currency?.USD}{priceRange?.[1] ?? 0}
                          </span>
                        </div>

                        <div className={styles.sliderWrapper}>
                          {priceRange && (
                            <>
                              <input
                                type="range"
                                min={lowestPrice}
                                max={highestPrice}
                                value={priceRange[0]}
                                onChange={(e) => handlePriceRangeChange(e, 0)}
                                className={styles.priceSlider}
                              />
                              <input
                                type="range"
                                min={lowestPrice}
                                max={highestPrice}
                                value={priceRange[1]}
                                onChange={(e) => handlePriceRangeChange(e, 1)}
                                className={styles.priceSlider}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={styles.filterOptionsGrid}>
                        {aggregation.options.map((option: any) => (
                          <label key={option.value} className={styles.filterOption}>
                            <input
                              type="checkbox"
                              value={option.value}
                              checked={isChecked(aggregation.label, option.value)}
                              onChange={(e) => {
                                handleCheckboxChange(aggregation.label, option.value, e.target.checked)
                              }}
                            />
                            {option.label.replace(/_/g, " ")}
                          </label>
                        ))}
                      </div>
                    )
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Filter