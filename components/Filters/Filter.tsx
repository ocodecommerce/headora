import { useEffect, useState } from "react";
import styles from "../../styles/Categories.module.css";
import Image from "next/image";

const Filter: any = ({
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
  setActiveFilters
}: any) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});

  // useEffect(() => {
  //   setPriceRange([lowestPrice, highestPrice]);

  //   // Generate steps for the price range
  //   const stepSize = 100; // Define the range interval (e.g., 100)
  //   const stepsArray = [];
  //   for (
  //     let i = Math.floor(lowestPrice / stepSize) * stepSize;
  //     i <= highestPrice;
  //     i += stepSize
  //   ) {
  //     stepsArray.push(i);
  //   }
  // }, [highestPrice, lowestPrice]);

  const toggleMobileSort = () => {
    setIsMobileSortOpen(!isMobileSortOpen);
  };
  const closeMobileSort = () => {
    setIsMobileSortOpen(false);
  };

  const visibleAggregations = categoriesData?.products?.aggregations.filter(
    (aggregation: any) =>
      aggregation.label !== "Category" && aggregation.label !== "Lead Time"
  );

  const displayedAggregations = showMoreFilters
    ? visibleAggregations
    : visibleAggregations.slice(0, 5);

  const isChecked = (label: any, value: any) => {
    let key = "";
    for (let i = 0; i < filterOptions?.length; i++) {
      if (filterOptions[i].label === label) {
        key = filterOptions[i].value;
      }
    }
    return filters[key]?.includes(value) || false;
  };

  const handleFilerOpen = () => {
    setIsFilterOpen(isFilterOpen);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSortOption(event.target.value);

    handleSortOptionClick(event.target.value);
  };

  const handleCloseFilterModal = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the clicked element is the overlay itself
    if (
      (e.target as HTMLDivElement).classList.contains(styles.filterOverlayOpen)
    ) {
      handleFilterClick();
    }
  };
  // Open the first group by default when the data is loaded
  useEffect(() => {
    if (categoriesData?.products?.aggregations?.length > 0) {
      const firstGroupLabel = categoriesData.products.aggregations[0].label;
      setOpenGroups({ [firstGroupLabel]: true });
    }
  }, [categoriesData]);

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => {
      const isCurrentlyOpen = prev[groupLabel];
      const newState = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {} as Record<string, boolean>);

      if (!isCurrentlyOpen) {
        newState[groupLabel] = true;
      }

      return newState;
    });
  };

  const midPrice = (highestPrice + lowestPrice) / 2;

  return (
    <>
      <div className={styles.sortContainer}>
        <div className={styles.filterDesktopButton}>
          <button onClick={handleFilterClick}>
            {" "}
            Filter{" "}
            <Image
              style={{ cursor: "pointer" }}
              src="/Images/filter.png"
              alt="Show More"
              width={23}
              height={25}
            />
          </button>
        </div>
        <div className={styles.sortInerContent}>
          {/* <span className={styles.lightSpan}>
      
          </span> */}
          <span className={`${styles.lightSpan} ${styles.borderRight}`}>
            {productCount} Results
          </span>
          <div
            className={styles.sortList}
            onMouseEnter={() => handleSortListHover(true)}
            onMouseLeave={() => handleSortListHover(false)}
          >
            <span>Sort by Position</span>{" "}
            <span>
              <Image
                src="/Images/down-arrow.png"
                alt="Sort"
                width={10} // set width appropriately
                height={10} // set height appropriately
              />
            </span>
            {isSortListHovered && (
              <div className={styles.sortDropdown}>
                <ul>
                  <li className={styles.sortOption}>
                    <label
                      className={
                        selectedSortOption === "priceHighToLow"
                          ? styles.active
                          : ""
                      }
                    >
                      <input
                        type="checkbox"
                        name="sortOption"
                        value="priceHighToLow"
                        checked={selectedSortOption === "priceHighToLow"}
                        onChange={handleSortChange}
                        className={styles.customCheckbox}
                      />
                      Price: High to Low
                    </label>
                  </li>
                  <li className={styles.sortOption}>
                    <label
                      className={
                        selectedSortOption === "priceLowToHigh"
                          ? styles.active
                          : ""
                      }
                    >
                      <input
                        type="checkbox"
                        name="sortOption"
                        value="priceLowToHigh"
                        checked={selectedSortOption === "priceLowToHigh"}
                        onChange={handleSortChange}
                        className={styles.customCheckbox}
                      />
                      Price: Low to High
                    </label>
                  </li>
                  <li className={styles.sortOption}>
                    <label
                      className={
                        selectedSortOption === "productNameAtoZ"
                          ? styles.active
                          : ""
                      }
                    >
                      <input
                        type="checkbox"
                        name="sortOption"
                        value="productNameAtoZ"
                        checked={selectedSortOption === "productNameAtoZ"}
                        onChange={handleSortChange}
                        className={styles.customCheckbox}
                      />
                      Product Name: (A to Z)
                    </label>
                  </li>
                  <li className={styles.sortOption}>
                    <label
                      className={
                        selectedSortOption === "productNameZtoA"
                          ? styles.active
                          : ""
                      }
                    >
                      <input
                        type="checkbox"
                        name="sortOption"
                        value="productNameZtoA"
                        checked={selectedSortOption === "productNameZtoA"}
                        onChange={handleSortChange}
                        className={styles.customCheckbox}
                      />
                      Product Name: (Z to A)
                    </label>
                  </li>
                  <li className={styles.sortOption}>
                    <label
                      className={
                        selectedSortOption === "none" ? styles.active : ""
                      }
                    >
                      <input
                        type="checkbox"
                        name="sortOption"
                        value="none"
                        checked={selectedSortOption === "none"}
                        onChange={handleSortChange}
                        className={styles.customCheckbox}
                      />
                      Default
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
            <button onClick={handleFilterClick}>FILTER BY </button>
          </div>

          <div className={styles.MobileFilterNavbarItem}>
            <button onClick={toggleMobileSort}>SORT BY </button>
          </div>
        </div>
      </div>

      {/* =========================Mobile Sort Options=========================*/}

      {isMobileSortOpen && (
        <div
          className={styles.filterModal}
          style={{ width: "100%", zIndex: "1" }}
        >
          <div className={styles.filterHeader}>
            <label>Sort By</label>
            <button
              onClick={closeMobileSort}
              className={styles.closeFilterButton}
            >
              &times;
            </button>
          </div>
          <div className={styles.mobileSortDropdown}>
            <ul className={styles.dropdownMenu}>
              <li className={styles.sortOption}>
                <label
                  className={
                    selectedSortOption === "priceHighToLow" ? styles.active : ""
                  }
                >
                  <input
                    type="checkbox"
                    name="sortOption"
                    value="priceHighToLow"
                    checked={selectedSortOption === "priceHighToLow"}
                    onChange={handleSortChange}
                    className={styles.customCheckbox}
                  />
                  Price: High to Low
                </label>
              </li>
              <li className={styles.sortOption}>
                <label
                  className={
                    selectedSortOption === "priceLowToHigh" ? styles.active : ""
                  }
                >
                  <input
                    type="checkbox"
                    name="sortOption"
                    value="priceLowToHigh"
                    checked={selectedSortOption === "priceLowToHigh"}
                    onChange={handleSortChange}
                    className={styles.customCheckbox}
                  />
                  Price: Low to High
                </label>
              </li>
              <li className={styles.sortOption}>
                <label
                  className={
                    selectedSortOption === "productNameAtoZ"
                      ? styles.active
                      : ""
                  }
                >
                  <input
                    type="checkbox"
                    name="sortOption"
                    value="productNameAtoZ"
                    checked={selectedSortOption === "productNameAtoZ"}
                    onChange={handleSortChange}
                    className={styles.customCheckbox}
                  />
                  Product Name: (A to Z)
                </label>
              </li>
              <li className={styles.sortOption}>
                <label
                  className={
                    selectedSortOption === "productNameZtoA"
                      ? styles.active
                      : ""
                  }
                >
                  <input
                    type="checkbox"
                    name="sortOption"
                    value="productNameZtoA"
                    checked={selectedSortOption === "productNameZtoA"}
                    onChange={handleSortChange}
                    className={styles.customCheckbox}
                  />
                  Product Name: (Z to A)
                </label>
              </li>
              <li className={styles.sortOption}>
                <label
                  className={selectedSortOption === "none" ? styles.active : ""}
                >
                  <input
                    type="checkbox"
                    name="sortOption"
                    value="none"
                    checked={selectedSortOption === "none"}
                    onChange={handleSortChange}
                    className={styles.customCheckbox}
                  />
                  Default
                </label>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {/* {isFilterOpen && ( */}
      <div
        className={
          isFilterOpen ? styles.filterOverlayOpen : styles.filterOverlay
        } // Add overlay styling
        onClick={handleCloseFilterModal} // Handle clicks on overlay
      >
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
                  const label = categoriesData?.products?.aggregations
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

            {categoriesData?.products?.aggregations
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
      {/* // )} */}
    </>
  );
};

export default Filter;
