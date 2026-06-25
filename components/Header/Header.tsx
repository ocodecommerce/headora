import React, { useEffect, useRef, useState } from "react";
import styles from "../../styles/Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { Client } from "@/graphql/client";
import CartBag from "./CartBag";
import { useRouter } from "next/router";
import QuickSearch from "../Search/QuickSearch";

function Header({ categoriesList,megamenu }: any) {
  // console.log(megamenu,"megamenu")
  const [isSearchOpen, setSearchOpen] = useState<boolean>(false); // New state for search input
  const [searchText, setSearchText] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any>(); // Store search results
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCartBag, setShowCartBag] = useState(false);
  const [cartCount, setCartCount] = useState<any>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(false)

  // const categories = categoriesList?.data?.categories?.items[0]?.children || [];
  const inputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState(categoriesList?.data?.categories?.items[0]?.children || [])
  const client = new Client();
  const router = useRouter();

  function handleStorageChange() {
    let newcartCount: any = localStorage.getItem("cartCount")
      ? localStorage.getItem("cartCount")
      : 0;
    let newwshowcartBag: any = localStorage.getItem("showcartBag")
      ? localStorage.getItem("showcartBag")
      : "false";

    if (parseInt(newcartCount) > 0) {
      setCartCount(parseInt(newcartCount));
      if (newwshowcartBag == "true") {
        localStorage.setItem("showcartBag", "false");
        setShowCartBag(true);
      }
    }
  }


  const sortOnlyChildrenAlphabetically = (items: any[]): any[] => {
    if (!Array.isArray(items)) return items;
  
    return items.map((item: any) => ({
      ...item,
      children: Array.isArray(item?.children)
        ? item.children
            .slice()
            .sort((a: any, b: any) =>
              String(a?.name || "").localeCompare(String(b?.name || ""))
            )
            .map((child: any) => ({
              ...child,
              children: sortOnlyChildrenAlphabetically(child?.children),
            }))
        : item?.children,
    }));
  };


  const checkUserLogin = async () => {
    try {
      if (typeof window !== "undefined" && window.location.hostname === "localhost") {
        console.log("Skipping user sync on localhost")
        return
      }
      const response = await fetch(`${process.env.baseURL}fcprofile/sync/index`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) throw new Error("Network response was not ok")
      const user = await response.json()
      if (user.logged_in) {
        setUserLoggedIn(true)
        // await fetchWishlistId()
      } else {
        setUserLoggedIn(false)
        
        router.push("/customer/account/login/")
      }
    } catch (error) {
      console.error("Error checking user login status:", error)
      setUserLoggedIn(false)
    }
  }



  useEffect(() => {
    const fetchMegaMenu = async () => {
      try {
        setLoading(true);
  
        // 1️⃣ Try the new megaMenuJson API first
            {/* Change bottom feom refiend cat to categories to ADD MEGA Menu */}
            
        const data = megamenu?.data
        // const data:any = []
// console.log(data,"data")
        if (data){
     

  
        let menuItems: any[] = [];
  
        if (data?.megaMenuJson?.success && Array.isArray(data.megaMenuJson.items)) {

          console.log("✅ Good Going");
          // ✅ New API structure (already JSON)
          menuItems = data.megaMenuJson.items.map((item: any, i: number) => ({
            uid: item.uid || `menu-${i}`,
            name: item.title,
            url_path: item.link_url?.replace(/\.html$/, "") || "",
            image: item.image || "",
            children:
              item.children?.map((child: any, j: number) => ({
                uid: child.uid || `menu-${i}-${j}`,
                name: child.title,
                url_path: child.link_url?.replace(/\.html$/, "") || "",
                children:
                  child.children?.map((sub: any, k: number) => ({
                    uid: sub.uid || `menu-${i}-${j}-${k}`,
                    name: sub.title,
                    url_path: sub.link_url?.replace(/\.html$/, "") || "",
                    children: sub.children || [],
                  })) || [],
              })) || [],
          }));


        } else if (categoriesList?.data?.categories?.items?.[0]?.children) {
          console.log("✅ Fallback to Magento categories API structure");
          // ✅ Fallback to Magento categories API structure
          menuItems = categoriesList.data.categories.items[0].children;
        } else {
          console.warn("⚠️ No valid menu data found from either API");
        }
  
        // setCategories(menuItems);
        setCategories(sortOnlyChildrenAlphabetically(menuItems));

      }else{
        setLoading(false);
      }
      } catch (error) {
        console.error("Error fetching mega menu:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMegaMenu();
  }, []);


  useEffect(() => {
    const handleRouteChange = () => {
      setLoading(false);
      closeSearch()
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    let newcartCount: any = localStorage.getItem("cartCount")
      ? localStorage.getItem("cartCount")
      : 0;
    if (parseInt(newcartCount) > 0) {
      setCartCount(parseInt(newcartCount));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
  }, []);

  const toggleCartBag = () => {
    setShowCartBag(!showCartBag);
  };
  const updateCartCount = (newcartCount: any) => {
    localStorage.setItem("cartCount", newcartCount);
    if (parseInt(newcartCount) > 0) {
      setCartCount(parseInt(newcartCount));
    }
    setShowCartBag(true);
  };
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchText(""); // Clear search input
    setSearchResults([]); // Optional: clear results

  }
  const toggleSearch = () => {
    setSearchOpen((prev) => {
      const newState = !prev;
      if (!newState) {
        setSearchText(""); // Clear search input
        setSearchResults([]); // Optional: clear results
      }
      return newState;
    });
  };
  // Fetch search suggestions dynamically
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);

    if (text.length >= 2) {
      // Trigger search for 2+ characters
      setLoading(true);

      const data = await client.fetchSearchResult(text, 1);
      setSearchResults(data || []);
      setLoading(false);
    } else {
      setSearchResults([]); // Clear results if input is cleared
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchText.trim()) {
      setLoading(true); // Show loading spinner
      (event.target as HTMLInputElement).blur(); // Optional
      router.push(`/search/?query=${encodeURIComponent(searchText.trim())}`);
      // Don't close search here — it'll be closed after route change
    }
  };

const refinedCategories = (categories || []).map((category: any) => {
  const refinedChildren = category.children?.map((subCategory: any) => {
    const refinedSubChildren = subCategory.children?.slice(0, 4); // Keep slice if you still want to limit the sub-sub categories

    return {
      ...subCategory,
      children: refinedSubChildren,
    };
  });

  return {
    ...category,
    children: refinedChildren,
  };
});



  // ==================Contact us Drop Down==============

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  // console.log(refinedCategories, 'refinedCategories')
  return (
    <nav className={styles.navbar}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link href={"/"}>
            {process.env.logoURL?.length === 0 ? (
              `${process.env.logoText}`
            ) : (
              <Image
                src={`${process.env.logoText}`}
                alt="Logo"
                width={120}
                height={35}
                className={styles.logo}
              />
            )}
          </Link>
        </div>
        {/* <div className={styles.contactUsDropdownContainer} onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          <span className={styles.contactUsToggle} style={{ fontSize: '12px' }} >
            <Image
              src="/Images/person-call.svg"
              alt="person call"
              width={16}
              height={16}
              className={styles.contactUsIcon}
            />
            <span>Contact Us</span>


          </span>
          <div style={{ marginTop: '10px', borderTop: '1px solid #e6e6e6', paddingTop: '10px' }} className={`${styles.contactUsDropdownContent}${isDropdownOpen ? styles.open : ''}`} >
            <ul>
              <span className={styles.contactUsDropdownlist} onClick={() => { window.open(`${process.env.baseURLWithoutTrailingSlash}/faq`, "_blank") }}>
                <Image src="/Images/contact.png" alt="person call" width={15} height={15} />
                Contact
              </span>
              <span className={styles.contactUsDropdownlist}>
                <Image src="/Images/chat-118.png" alt="chat" width={15} height={15} />
                Chat
              </span>
              <a className={styles.personalChat} href="tel:+18006903736">
                <Image src="/Images/call.png" alt="person call" width={13} height={13} />
                +1 800-690-3736
              </a>
            </ul>
          </div>
        </div> */}
        <nav className={styles.nav}>
          <ul className={styles.navItems}>
            {categories.map((category: any) => (
              <li
                key={category.uid}
                className={styles.navItem}
                // style={
                //   category.children.length < 5 ? { position: "relative" } : { position: "unset" }
                // }
              >
                <Link href={`/${category.url_path?.replace(/^\/+/, "")}`}>{category.name}</Link>

                <>
                  {category.children.length > 0 && (
                    <span className={styles.icon}>
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
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  )}

                  {/* {category.children?.some((subCategory: any) => subCategory.product_count ? ( */}

                  {category.children.length > 5 || category.children.some((child: any) => child.children 
                  // && child.children.length > 0
                ) ? (

                    <div className={styles.dropdown}>
                      {category.name.toLowerCase() == "brands" ? (<h3 className={styles.MegaMenuBrandsHeading}>Brands</h3>) : (null)}
                      <div className={styles.megaMenuContainer}>

                        <div
                          className={`${styles.categoryGrid} ${category.children.length <= 5
                              ? styles.fewCategories
                              : ""
                            }`}
                          style={{
                            gap:
                              category.name.toLowerCase() == "brands"
                                ? "10px"
                                : undefined,
                          }}
                        >
                          {category.children.map((subCategory: any) => (
                            <div
                              key={subCategory.uid}
                              className={styles.categoryColumn}
                            >
                              <span className={styles.categoryTitle}>
                                <Link href={`/${subCategory.url_path?.replace(/^\/+/, "")}`}>{subCategory.name}</Link>
                              </span>

                              {subCategory.children?.length > 0 && (
                                <ul className={styles.subCategoryList}>
                                  {subCategory.name.toLowerCase() !== "brand" &&
                                    subCategory.children.map(
                                      (subSubCategory: any) => (
                                        <li
                                          key={subSubCategory.uid}
                                          style={{
                                            padding:
                                              category.name.toLowerCase() ==
                                                "brands"
                                                ? "0px"
                                                : undefined,
                                          }}
                                        >
                                          {category.name.toLowerCase() !==
                                            "brands" ? (
                                            <Link
                                              href={`${subSubCategory.url_path}`}
                                            >
                                              {subSubCategory.name}
                                            </Link>
                                          ) :

                                            null}
                                        </li>
                                      )
                                    )}

                                  {subCategory.children.length > 4 && (
                                    <li className={styles.viewAllLink}>
                                      <Link href={`/${subCategory.url_path?.replace(/^\/+/, "")}`}>
                                        View All
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* <div className={styles.bannerColumn}>
                          <img
                            src={category.image || "/Images/Affirm banner.png"}
                            alt={`${category.name} Banner`}
                            className={styles.bannerImage}
                          />
                        </div> */}
                      </div>
                    </div>
                  ) : category.children
                    ? (
                      // ------------------start -------------------

                      <div
                        className={styles.dropdown}
                        style={{ minWidth: "140px", width: 'unset', 
                          padding: category.children?.length === 0 ? "0" : "10px 10px", 
                          borderBottom: category.children?.length === 0 ? 'unset' :'', 
                          boxShadow:category.children?.length === 0 ? 'unset' :'', 
                          borderTop:category.children?.length === 0 ? 'unset' :''
                           }}
                      >
                        <div className={styles.megaMenuContainer}>
                          <div
                            className={`${styles.categoryGrid} ${category.children.length >= 5
                                ? styles.fewCategories
                                : ""
                              }`}
                            style={{
                              gap:
                                category.name.toLowerCase() == "brands"
                                  ? "10px"
                                  : undefined,
                              gridTemplateColumns: "repeat(1, 1fr)",
                            }}
                          >
                            {category.children.map((subCategory: any) => (
                              <div
                                key={subCategory.uid}
                                className={styles.categoryColumn}
                              >
                                <span className={styles.categoryTitle}>
                                  <Link href={`/${subCategory.url_path?.replace(/^\/+/, "")}`}>
                                    {subCategory.name}
                                  </Link>
                                </span>

                                {subCategory.children?.length > 0 && (
                                  <ul className={styles.subCategoryList}>
                                    {subCategory.name.toLowerCase() !== "brand" &&
                                      subCategory.children.map(
                                        (subSubCategory: any) => (
                                          <li
                                            key={subSubCategory.uid}
                                            style={{
                                              padding:
                                                category.name.toLowerCase() ==
                                                  "brands"
                                                  ? "0px"
                                                  : undefined,
                                            }}
                                          >
                                            {category.name.toLowerCase() !==
                                              "brands" ? (
                                              <Link
                                                href={`${subSubCategory.url_path}`}
                                              >
                                                {subSubCategory.name}
                                              </Link>
                                            ) : // category.children && category.children?.some((subCategory: any) => subCategory.length > 1) ? (
                                              // <div className={styles.dropdown}>
                                              //    <div className={styles.megaMenuContainer}>
                                              //  <>Load</>
                                              //  </div>
                                              //  </div>
                                              null}
                                          </li>
                                        )
                                      )}

                                    {subCategory.children.length > 4 && (
                                      <li className={styles.viewAllLink}>
                                        <Link href={`/${subCategory.url_path?.replace(/^\/+/, "")}`}>
                                          View All
                                        </Link>
                                      </li>
                                    )}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : // {/* -----------------------end ----------------------- */}

                    null}
                </>
                {/* )} */}
              </li>
            ))}



          </ul>
        </nav>
        <div className={styles.actions}>
          {/* ================================= Quick Search================================ */}
          {isSearchOpen && (
            <QuickSearch
              isSearchOpen={isSearchOpen}
              toggleSearch={toggleSearch}
              searchText={searchText}
              handleSearchChange={handleSearchChange}
              handleKeyDown={handleKeyDown}
              isLoading={isLoading}
              searchResults={searchResults?.products?.items}
              ref={inputRef}
              searchCategory={searchResults}
            />
          )}

          <div className={styles.actionItemWrapper}>
            {/* <Link href="/cart"> */}

{/*  */}
            {/* <li> */}
              <div className={styles.actionItem} onClick={toggleSearch}>
                <span className={styles.icon}>
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
                    className="icon-icon-_rq"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                Search
              </div>



              <div className={styles.actionItem} onClick={checkUserLogin}>
                <span className={styles.icon}>
                 
                  <Image
                    src="/Images/personHeader.png"
                    alt="person icon"
                    width={24}
                    height={24}
                  />
                </span>
                {!userLoggedIn? "Sign in" : ""}
              </div>


            {/* </li> */}


            {/* <span className={styles.icon}>

              <Link href={'/boutique/wishlist/'} >
                <div className={styles.iconContainer}>
                  <Image className={styles.whishlistBlackIcon} src={'/Images/BlackHeart.png'} height={20} width={23} alt="wishlist icon" />
                  <Image className={styles.whishlistGoldenIcon} src={'/Images/wishlistIcon.png'} height={20} width={23} alt="wishlist icon" />
                </div>
              </Link>
            </span> */}
            <span className={styles.icon} onClick={toggleCartBag}>
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
                className="icon-icon-_rq"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {parseInt(cartCount) > 0 && (
                <span className={styles.cartCountNumber}>{cartCount}</span>
              )}
            </span>
            {/* </Link> */}
          </div>
        </div>
      </header>
      {showCartBag && (
        <CartBag
          // showCartBag={showCartBag}
          toggleCartBag={toggleCartBag}
          updateCartCount={updateCartCount}
        />
      )}
    </nav>
  );
}

export default Header;