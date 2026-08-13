import React, { useEffect, useRef, useState } from "react";
import styles from "../../styles/Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { Client } from "@/graphql/client";
import CartBag from "./CartBag";
import { useRouter } from "next/router";
import QuickSearch from "../Search/QuickSearch";

function Header({ categoriesList, megamenu }: any) {
  const [isSearchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCartBag, setShowCartBag] = useState(false);
  const [cartCount, setCartCount] = useState<any>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(false);

  // ========== SIGN IN MODAL STATE ==========
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState(
    categoriesList?.data?.categories?.items[0]?.children || []
  );
  const client = new Client();
  const router = useRouter();


  // ========== ADD THESE STATES (near other useState) ==========
const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

// Create Account fields
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [createEmail, setCreateEmail] = useState("");
const [createPassword, setCreatePassword] = useState("");
const [showCreatePassword, setShowCreatePassword] = useState(false);
const [subscribeNews, setSubscribeNews] = useState(false);
const [createLoading, setCreateLoading] = useState(false);
const [createError, setCreateError] = useState("");

// Forgot Password
const [forgotEmail, setForgotEmail] = useState("");
const [forgotLoading, setForgotLoading] = useState(false);
const [forgotError, setForgotError] = useState("");
const [forgotSuccess, setForgotSuccess] = useState("");

const signInModalRef = useRef<HTMLDivElement>(null);
const createAccountModalRef = useRef<HTMLDivElement>(null);
const forgotPasswordModalRef = useRef<HTMLDivElement>(null);


// ========== CLOSE MODALS ON OUTSIDE CLICK ==========
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest(`.${styles.signInTrigger}`)) return;

    if (showSignInModal && signInModalRef.current && !signInModalRef.current.contains(target)) {
      setShowSignInModal(false);
      setSignInError("");
    }
    if (showCreateAccountModal && createAccountModalRef.current && !createAccountModalRef.current.contains(target)) {
      setShowCreateAccountModal(false);
      setCreateError("");
    }
    if (showForgotPasswordModal && forgotPasswordModalRef.current && !forgotPasswordModalRef.current.contains(target)) {
      setShowForgotPasswordModal(false);
      setForgotError("");
      setForgotSuccess("");
    }
  };

  if (showSignInModal || showCreateAccountModal || showForgotPasswordModal) {
    document.addEventListener("mousedown", handleClickOutside);
  }
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [showSignInModal, showCreateAccountModal, showForgotPasswordModal]);


// ========== OPEN SIGN IN ==========
const checkUserLogin = async () => {
  if (userLoggedIn) {
    router.push("/customer/account/");
    return;
  }
  setShowSignInModal(true);
  setShowCreateAccountModal(false);
  setShowForgotPasswordModal(false);
  setSignInError("");
};


// ========== SIGN IN (generateCustomerToken) ==========
const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setSignInError("");
  setSignInLoading(true);

  try {
    // GraphQL mutation: generateCustomerToken
    const response = await client.generateCustomerToken(email, password);
    // Expected shape: response.data.generateCustomerToken.token

    const token = response?.data?.generateCustomerToken?.token;

    if (token) {
      // Store token
      localStorage.setItem("customerToken", token);
      // Optional: also set cookie if your backend needs it
      // document.cookie = `customerToken=${token}; path=/; max-age=86400`;

      setUserLoggedIn(true);
      setShowSignInModal(false);
      setEmail("");
      setPassword("");

      // Redirect after successful login
      router.push("/customer/account/");
    } else {
      setSignInError("Invalid email or password.");
    }
  } catch (error: any) {
    console.error("Sign in error:", error);
    setSignInError(
      error?.message ||
      error?.graphQLErrors?.[0]?.message ||
      "Something went wrong. Please try again."
    );
  } finally {
    setSignInLoading(false);
  }
};

// CHECK"


useEffect(() => {
  const checkUserLogin = async () => {
    try {

      let userData = null;

      if (!userData) {
        if (typeof window !== "undefined" && window.location.hostname === "localhost") {
          console.log("Skipping API call on localhost due to CORS");
          setUserLoggedIn(false);
          return;
        }

        const response = await fetch(`${process.env.baseURL}fcprofile/sync/index`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user sync data");

        userData = await response.json();
        console.log("Sync API response:", userData);
        sessionStorage.setItem("userSyncData", JSON.stringify(userData));
      }
      console.log(userData,!!userData?.logged_in, "userData");
      setUserLoggedIn(!!userData?.logged_in);
    } catch (error) {
      console.error("Error during user sync:", error);
      setUserLoggedIn(false);
    }
  };

  checkUserLogin();
}, []);


useEffect(() => {
  const userDataString = sessionStorage.getItem("userSyncData");
  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      setUserLoggedIn(userData.logged_in ?? false);
    } catch (error) {
      console.error("Failed to parse userSyncData:", error);
      setUserLoggedIn(false);
    }
  } else {
    setUserLoggedIn(false);
  }
}, []);

// ========== CREATE ACCOUNT (createCustomerV2) ==========
const handleCreateAccount = async (e: React.FormEvent) => {
  e.preventDefault();
  setCreateError("");
  setCreateLoading(true);

  try {
    // GraphQL mutation: createCustomerV2
    const response = await client.createCustomerV2({
      firstname: firstName,
      lastname: lastName,
      email: createEmail,
      password: createPassword,
      // is_subscribed: subscribeNews, // uncomment if your schema supports it
    });

    // Expected: response.data.createCustomerV2.customer
    const customer = response?.data?.createCustomerV2?.customer;

    if (customer) {
      // Auto-login after registration
      try {
        const loginRes = await client.generateCustomerToken(createEmail, createPassword);
        const token = loginRes?.data?.generateCustomerToken?.token;

        if (token) {
          localStorage.setItem("customerToken", token);
          setUserLoggedIn(true);
        }
      } catch (loginErr) {
        console.warn("Account created but auto-login failed", loginErr);
      }

      setShowCreateAccountModal(false);
      setFirstName("");
      setLastName("");
      setCreateEmail("");
      setCreatePassword("");
      setSubscribeNews(false);

      // Redirect after successful registration
      router.push("/customer/account/");
    } else {
      setCreateError("Could not create account. Please try again.");
    }
  } catch (error: any) {
    console.error("Create account error:", error);
    setCreateError(
      error?.message ||
      error?.graphQLErrors?.[0]?.message ||
      "Something went wrong. Please try again."
    );
  } finally {
    setCreateLoading(false);
  }
};


// ========== FORGOT / RECOVER PASSWORD ==========
const handleForgotPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setForgotError("");
  setForgotSuccess("");
  setForgotLoading(true);

  try {
    // TODO: Connect your requestPasswordResetEmail mutation
    // Example:
    // const response = await client.requestPasswordResetEmail(forgotEmail);
    // if (response?.data?.requestPasswordResetEmail) {
    //   setForgotSuccess("If an account exists with this email, you will receive a password reset link shortly.");
    // }

    // Temporary placeholder
    console.log("Password reset requested for:", forgotEmail);
    setForgotSuccess(
      "If an account exists with this email, you will receive a password reset link shortly."
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    setForgotError(
      error?.message ||
      error?.graphQLErrors?.[0]?.message ||
      "Something went wrong. Please try again."
    );
  } finally {
    setForgotLoading(false);
  }
};


// ========== SWITCH BETWEEN MODALS ==========
const openCreateAccount = () => {
  setShowSignInModal(false);
  setShowForgotPasswordModal(false);
  setShowCreateAccountModal(true);
  setCreateError("");
};

const openForgotPassword = () => {
  setShowSignInModal(false);
  setShowCreateAccountModal(false);
  setShowForgotPasswordModal(true);
  setForgotError("");
  setForgotSuccess("");
  setForgotEmail(email); // pre-fill from sign-in if available
};

const openSignIn = () => {
  setShowCreateAccountModal(false);
  setShowForgotPasswordModal(false);
  setShowSignInModal(true);
  setSignInError("");
};

const closeAllModals = () => {
  setShowSignInModal(false);
  setShowCreateAccountModal(false);
  setShowForgotPasswordModal(false);
  setSignInError("");
  setCreateError("");
  setForgotError("");
  setForgotSuccess("");
};

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        signInModalRef.current &&
        !signInModalRef.current.contains(event.target as Node)
      ) {
        // Only close if click is outside the modal itself
        const target = event.target as HTMLElement;
        if (!target.closest(`.${styles.signInTrigger}`)) {
          setShowSignInModal(false);
          setSignInError("");
        }
      }
    };

    if (showSignInModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSignInModal]);

  // Close modal on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setShowSignInModal(false);
      setSignInError("");
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

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





  useEffect(() => {
    const fetchMegaMenu = async () => {
      try {
        setLoading(true);

        const data = megamenu?.data;

        if (data) {
          let menuItems: any[] = [];

          if (data?.megaMenuJson?.success && Array.isArray(data.megaMenuJson.items)) {
            console.log("✅ Good Going");
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
            menuItems = categoriesList.data.categories.items[0].children;
          } else {
            console.warn("⚠️ No valid menu data found from either API");
          }

          setCategories(sortOnlyChildrenAlphabetically(menuItems));
        } else {
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
      closeSearch();
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
    setSearchText("");
    setSearchResults([]);
  };

  const toggleSearch = () => {
    setSearchOpen((prev) => {
      const newState = !prev;
      if (!newState) {
        setSearchText("");
        setSearchResults([]);
      }
      return newState;
    });
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);

    if (text.length >= 2) {
      setLoading(true);
      const data = await client.fetchSearchResult(text, 1);
      setSearchResults(data || []);
      setLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchText.trim()) {
      setLoading(true);
      (event.target as HTMLInputElement).blur();
      router.push(`/search/?query=${encodeURIComponent(searchText.trim())}`);
    }
  };

  const refinedCategories = (categories || []).map((category: any) => {
    const refinedChildren = category.children?.map((subCategory: any) => {
      const refinedSubChildren = subCategory.children?.slice(0, 4);
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

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

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

        <nav className={styles.nav}>
          <ul className={styles.navItems}>
            {categories.map((category: any) => (
              <li
                key={category.uid}
                className={styles.navItem}
                style={
                  category.children.length < 5
                    ? { position: "relative" }
                    : { position: "unset" }
                }
              >
                <Link href={`/${category.url_path?.replace(/^\/+/, "")}`}>
                  {category.name}
                </Link>

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

                  {category.children.length > 5 ||
                  category.children.some(
                    (child: any) => child.children && child.children.length > 0
                  ) ? (
                    <div className={styles.dropdown}>
                      {category.name.toLowerCase() == "brands" ? (
                        <h3 className={styles.MegaMenuBrandsHeading}>Brands</h3>
                      ) : null}
                      <div className={styles.megaMenuContainer}>
                        <div
                          className={styles.categoryGrid}
                          style={{
                            gridTemplateColumns: `repeat(${Math.min(
                              category.children.length,
                              4
                            )}, 1fr)`,
                            gap:
                              category.name.toLowerCase() === "brands"
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
                                <Link
                                  href={`/${subCategory.url_path?.replace(
                                    /^\/+/,
                                    ""
                                  )}`}
                                >
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
                                          ) : null}
                                        </li>
                                      )
                                    )}

                                  {subCategory.children.length > 4 && (
                                    <li className={styles.viewAllLink}>
                                      <Link
                                        href={`/${subCategory.url_path?.replace(
                                          /^\/+/,
                                          ""
                                        )}`}
                                      >
                                        View All
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className={styles.bannerColumn}>
                          <Image
                            height={20}
                            width={23}
                            src={category.image || "/Images/Affirm banner.png"}
                            alt={`${category.name} Banner`}
                            className={styles.bannerImage}
                          />
                        </div>
                      </div>
                    </div>
                  ) : category.children ? (
                    <div
                      className={`${styles.dropdown} ${styles.dropdownShort}`}
                      style={{
                        minWidth: "140px",
                        width: "unset",
                        padding:
                          category.children?.length === 0 ? "0" : "10px 10px",
                        borderBottom:
                          category.children?.length === 0 ? "unset" : "",
                        boxShadow:
                          category.children?.length === 0 ? "unset" : "",
                        borderTop:
                          category.children?.length === 0 ? "unset" : "",
                      }}
                    >
                      <div className={styles.megaMenuContainerShort}>
                        <div
                          className={`${styles.categoryGrid} ${
                            category.children.length >= 5
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
                                <Link
                                  href={`/${subCategory.url_path?.replace(
                                    /^\/+/,
                                    ""
                                  )}`}
                                >
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
                                          ) : null}
                                        </li>
                                      )
                                    )}

                                  {subCategory.children.length > 4 && (
                                    <li className={styles.viewAllLink}>
                                      <Link
                                        href={`/${subCategory.url_path?.replace(
                                          /^\/+/,
                                          ""
                                        )}`}
                                      >
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
                  ) : null}
                </>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
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

            {/* ========== SIGN IN TRIGGER ========== */}
            <div
                className={`${styles.actionItem} ${styles.signInTrigger} ${
                  showSignInModal || showCreateAccountModal || showForgotPasswordModal
                    ? styles.signInTriggerActive
                    : ""
                }`}
                onClick={checkUserLogin}
              >
                <span className={styles.icon}>
                  <Image
                    src="/Images/personHeader.png"
                    alt="person icon"
                    width={24}
                    height={24}
                  />
                </span>
                {!userLoggedIn ? "Sign In" : "Account"}
              </div>

            {/* ========== SIGN IN MODAL (Venia style) ========== */}
            {showSignInModal && (
              <div className={styles.signInModalOverlay}>
                <div className={styles.signInModal} ref={signInModalRef}>
                  <h2 className={styles.signInTitle}>Sign-In To Your Account</h2>

                  <form onSubmit={handleSignIn} className={styles.signInForm}>
                    {/* Email */}
                    <div className={styles.formGroup}>
                      <label htmlFor="signInEmail" className={styles.formLabel}>
                        Email address
                      </label>
                      <input
                        id="signInEmail"
                        type="email"
                        className={styles.formInput}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        autoFocus
                      />
                    </div>

                    {/* Password */}
                    <div className={styles.formGroup}>
                      <label
                        htmlFor="signInPassword"
                        className={styles.formLabel}
                      >
                        Password
                      </label>
                      <div className={styles.passwordWrapper}>
                        <input
                          id="signInPassword"
                          type={showPassword ? "text" : "password"}
                          className={styles.formInput}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {/* Eye icon */}
                          {showPassword ? (
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
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
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
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Forgot Password */}
                    <div className={styles.forgotPassword}>
                      <Link href="/customer/account/forgotpassword/">
                        Forgot Password?
                      </Link>
                    </div>

                    {/* Error message */}
                    {signInError && (
                      <p className={styles.signInError}>{signInError}</p>
                    )}

                    {/* SIGN IN button */}
                    <div className={styles.signInBtnOuter}>
                    <button
                      type="submit"
                      className={styles.signInBtn}
                      disabled={signInLoading}
                    >
                      {signInLoading ? "SIGNING IN..." : "SIGN IN"}
                    </button>

                    {/* CREATE AN ACCOUNT button */}
                    <Link
                      href="/customer/account/create/"
                      className={styles.createAccountBtn}
                      onClick={() => setShowSignInModal(false)}
                    >
                      CREATE AN ACCOUNT
                    </Link>
                    </div>

                  </form>
                </div>
              </div>
            )}

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
          </div>


          {/* ========== SIGN IN MODAL ========== */}
{showSignInModal && (
  <div className={styles.signInModalOverlay}>
    <div className={styles.signInModal} ref={signInModalRef}>
      <h2 className={styles.signInTitle}>Sign-In To Your Account</h2>

      <form onSubmit={handleSignIn} className={styles.signInForm}>
        <div className={styles.formGroup}>
          <label htmlFor="signInEmail" className={styles.formLabel}>
            Email address
          </label>
          <input
            id="signInEmail"
            type="email"
            className={styles.formInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="signInPassword" className={styles.formLabel}>
            Password
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="signInPassword"
              type={showPassword ? "text" : "password"}
              className={styles.formInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className={styles.forgotPassword}>
          <button type="button" className={styles.linkBtn} onClick={openForgotPassword}>
            Forgot Password?
          </button>
        </div>

        {signInError && <p className={styles.signInError}>{signInError}</p>}
        <div className={styles.signInBtnOuter}>
        <button type="submit" className={styles.signInBtn} disabled={signInLoading}>
          {signInLoading ? "SIGNING IN..." : "SIGN IN"}
        </button>

        <button
          type="button"
          className={styles.createAccountBtn}
          onClick={openCreateAccount}
        >
          CREATE AN ACCOUNT
        </button>
         </div>
      </form>
    </div>
  </div>
)}


{/* ========== CREATE ACCOUNT MODAL ========== */}
{showCreateAccountModal && (
  <div className={styles.signInModalOverlay}>
    <div className={styles.signInModal} ref={createAccountModalRef}>
      <h2 className={styles.signInTitle}>Create an Account</h2>

      <form onSubmit={handleCreateAccount} className={styles.signInForm}>
        <div className={styles.formGroup}>
          <label htmlFor="firstName" className={styles.formLabel}>First Name</label>
          <input
            id="firstName"
            type="text"
            className={styles.formInput}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
            autoFocus
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lastName" className={styles.formLabel}>Last Name</label>
          <input
            id="lastName"
            type="text"
            className={styles.formInput}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="createEmail" className={styles.formLabel}>Email</label>
          <input
            id="createEmail"
            type="email"
            className={styles.formInput}
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="createPassword" className={styles.formLabel}>Password</label>
          <div className={styles.passwordWrapper}>
            <input
              id="createPassword"
              type={showCreatePassword ? "text" : "password"}
              className={styles.formInput}
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowCreatePassword(!showCreatePassword)}
              aria-label={showCreatePassword ? "Hide password" : "Show password"}
            >
              {showCreatePassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={subscribeNews}
            onChange={(e) => setSubscribeNews(e.target.checked)}
          />
          <span>Subscribe to news and updates</span>
        </label>

        {createError && <p className={styles.signInError}>{createError}</p>}

        <div className={styles.modalBtnRow}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={closeAllModals}
          >
            CANCEL
          </button>
          <button
            type="submit"
            className={styles.signInBtn}
            disabled={createLoading}
          >
            {createLoading ? "CREATING..." : "CREATE AN ACCOUNT"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}


{/* ========== RECOVER PASSWORD MODAL ========== */}
{showForgotPasswordModal && (
  <div className={styles.signInModalOverlay}>
    <div className={styles.signInModal} ref={forgotPasswordModalRef}>
      <h2 className={styles.signInTitle}>Recover Password</h2>

      <p className={styles.recoverText}>
        Please enter the email address associated with this account.
      </p>

      <form onSubmit={handleForgotPassword} className={styles.signInForm}>
        <div className={styles.formGroup}>
          <label htmlFor="forgotEmail" className={styles.formLabel}>
            Email address
          </label>
          <input
            id="forgotEmail"
            type="email"
            className={styles.formInput}
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        {forgotError && <p className={styles.signInError}>{forgotError}</p>}
        {forgotSuccess && <p className={styles.signInSuccess}>{forgotSuccess}</p>}

        <div className={styles.modalBtnRow}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={openSignIn}
          >
            CANCEL
          </button>
          <button
            type="submit"
            className={styles.signInBtn}
            disabled={forgotLoading}
          >
            {forgotLoading ? "SUBMITTING..." : "SUBMIT"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
        </div>
      </header>

      {showCartBag && (
        <CartBag
          toggleCartBag={toggleCartBag}
          updateCartCount={updateCartCount}
        />
      )}
    </nav>
  );
}

export default Header;