// components/Product/WishlistCompareButtons.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '../../styles/ProductDetail.module.css';
import { Client } from "@/graphql/client";
import Link from 'next/link';

interface WishlistCompareButtonsProps {
  product: any;
  isMounted?: boolean;
}

const WishlistCompareButtons: React.FC<WishlistCompareButtonsProps> = ({
  product,
  isMounted = true,
}) => {
  const router = useRouter();
  const client = new Client();

  // States
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<number | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(null);
  const [wishlistId, setWishlistId] = useState<any>(null);

  const [compareLoading, setCompareLoading] = useState(false);
  const [isInCompareState, setIsInCompareState] = useState(false);

  // Message Alert State
  const [message, setMessage] = useState<{ text: string; type:  'success' | 'successhtml' | 'error' } | null>(null);

  const COMPARE_KEY = "compareProducts";

  const showMessage = (text: string, type: 'success' | 'successhtml' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 100000);
  };

  // Compare Functions
  const checkIsInCompare = () => {
    if (typeof window === "undefined") return false;
    const items = localStorage.getItem(COMPARE_KEY);
    if (!items) return false;
    return JSON.parse(items).some((item: any) => item.id === product.id);
  };

  const handleAddToCompare = () => {
    setCompareLoading(true);
    const items = JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]');

    if (items.some((item: any) => item.id === product.id)) {
      setCompareLoading(false);
      return;
    }

    const compareProduct = {
      id: product.id,
      name: product.name || product.variant_name,
      sku: product.sku,
      price: product.price_range?.maximum_price?.final_price?.value,
      image: product.image?.url || product.media_gallery?.[0]?.url,
      url_key: product.url_key,
    };

    localStorage.setItem(COMPARE_KEY, JSON.stringify([...items, compareProduct]));
    setIsInCompareState(true);
    setCompareLoading(false);

    showMessage(`You added product <strong>${product.name}</strong> to the <a href="/compare" style="color:#e67e22; text-decoration:underline;">comparison list</a>.`, 'successhtml');

  };

  // Wishlist Functions
  const checkUserLogin = async () => {
    try {
      if (typeof window !== "undefined" && window.location.hostname === "localhost") {
        setUserLoggedIn(true);
        return true;
      }
      const response = await fetch(`${process.env.baseURL}fcprofile/sync/index`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const user = await response.json();
      const loggedIn = !!user.logged_in;
      setUserLoggedIn(loggedIn);
      return loggedIn;
    } catch {
      setUserLoggedIn(false);
      return false;
    }
  };

  const fetchWishlistId = async () => {
    try {
      const data = await client.fetchWishListID();
      const id = data?.data?.customer?.wishlist?.id;
      if (id) setWishlistId(id);
      return id;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const checkWishlistStatus = async () => {
    if (!userLoggedIn) return;
    try {
      const data = await client.fetchWishListProductsList();
      const items = data?.data?.customer?.wishlists?.[0]?.items_v2?.items || [];
      const found = items.find((item: any) => item.product?.sku === product.sku);
      if (found) {
        setIsInWishlist(true);
        setWishlistItemId(found.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleWishlist = async () => {
    setWishlistLoading(true);
    try {
      if (userLoggedIn === null) {
        const isLogged = await checkUserLogin();
        if (!isLogged) {
          router.push("/customer/account/login/");
          return;
        }
      }
      if (!userLoggedIn) {
        router.push("/customer/account/login/");
        return;
      }

      if (!wishlistId) {
        await fetchWishlistId();
      }

      if (wishlistId) {
        const result = await client.fetchWishlistMutation(product.sku, wishlistId);
        if (result?.data?.addProductsToWishlist?.wishlist) {
          setIsInWishlist(true);
          showMessage("Product added to Favorites successfully!");
        } else {
          showMessage("Failed to add to wishlist", 'error');
        }
      }
    } catch (error) {
      showMessage("Something went wrong. Please try again.", 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRemoveWishlist = async () => {
    if (!wishlistItemId) return;
    setWishlistLoading(true);
    try {
      const response = await client.fetchRemoveWishlistMutation(wishlistId, wishlistItemId);
      if (response?.data?.removeProductsFromWishlist?.wishlist) {
        setIsInWishlist(false);
        setWishlistItemId(null);
        showMessage("Product removed from Favorites");
      }
    } catch (error) {
      showMessage("Failed to remove from wishlist", 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    checkUserLogin();
    setIsInCompareState(checkIsInCompare());
  }, [product.id]);

  useEffect(() => {
    if (userLoggedIn) checkWishlistStatus();
  }, [userLoggedIn, product.sku]);



  return (
    <>
      {/* Message Alert */}
      {message && (

    message.type ==="successhtml" ? (
<div 
            className={styles.messageAlert}
            dangerouslySetInnerHTML={{ __html: message.text }}
          />    
    
   
) : (
        <div className={`${styles.messageAlert} ${message.type === 'error' ? styles.errorAlert : ''}`}>
          {message.text}
        </div>
        )
      )}
    <div className={styles.AdditionalButtonsBox_componenet}>
      {/* Wishlist Button */}
      <div className={styles.WishListIconWrraper}>
        {wishlistLoading ? (
          <div className={styles.SearchLoader} />
        ) : isInWishlist ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleRemoveWishlist();
            }}
            className={styles.wishwithcomparButton_componenet}
          >
            <Image
              src="/Images/wishlistIconFill.png"
              height={18}
              width={20}
              alt="wishlist filled"
            />
            Added to Favorites
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleWishlist();
            }}
            className={styles.wishwithcomparButton_componenet}
          >
            <Image
              src="/Images/wishlistIcon.png"
              height={18}
              width={20}
              alt="wishlist"
              style={{ filter: "brightness(0.1)" }}
            />
            {/* Add to Favorites */}
          </button>
        )}
      </div>

      {/* Compare Button */}
      <button
        className={styles.wishwithcomparButton_componenet}
        onClick={(e) => {
          e.preventDefault();
          handleAddToCompare();
        }}
        disabled={!isMounted || isInCompareState || compareLoading}
      >
        <Image
          src="/Images/compare.png"
          alt="Compare"
          width={22}
          height={20}
          style={{ filter: isInCompareState ? "invert(0.5)" : "none" }}
        />
        {compareLoading
          ? "Loading..."
          : null
        //    isInCompareState
        //   ? "Already in Compare"
        //   : "Add to Compare"
          }
      </button>
    </div>
    </>
  );
};

export default WishlistCompareButtons;