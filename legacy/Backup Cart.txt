"use client"
import { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import styles from "@/styles/CartBag.module.css"
import { Client } from '../../graphql/client'
// Currency formatter
const getFormattedCurrency = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};
interface CartItem {
  item_id: string
  entity_id: string
  sku: string
  name?: string
  image_url?: string
  url_key?: string
  price: number
  qty?: number
}
interface CartBagProps {
  toggleCartBag: () => void
  updateCartCount: (count: number) => void
}
function Skeleton({ className }: { className?: string }) {
  return <div className={`${styles.skeleton} ${className || ""}`} />
}
function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className={styles.spinner}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className={styles.spinner_track} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className={styles.spinner_head}
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
// Skeleton component for cart items
function CartItemSkeleton() {
  return (
    <div className={styles.cart_item_outer}>
      <div className={styles.cart_item}>
        <div className={styles.item_thumbnail}>
          <Skeleton className={styles.skeleton_image} />
        </div>
        <div className={styles.item_detail}>
          <Skeleton className={styles.skeleton_title} />
          <Skeleton className={styles.skeleton_title_short} />
          <Skeleton className={styles.skeleton_sku} />
        </div>
      </div>
      <div className={styles.comboPriceQua}>
        <Skeleton className={styles.skeleton_qty} />
        <Skeleton className={styles.skeleton_price} />
      </div>
    </div>
  )
}
// Skeleton for order summary
function OrderSummarySkeleton() {
  return (
    <div className={styles.Order_CartOrderSummary_wrapper}>
      <Skeleton className={styles.skeleton_summary_title} />
      <div className={styles.CartOrderSummary_wrapper}>
        <div className={styles.CartOrderSummary_container}>
          <div className={styles.CartOrderSummary_totalPriceContainer}>
            <Skeleton className={styles.skeleton_label} />
            <Skeleton className={styles.skeleton_value} />
          </div>
          <div className={styles.CartOrderSummary_deliveryInfo}>
            <Skeleton className={styles.skeleton_label_sm} />
            <Skeleton className={styles.skeleton_value_lg} />
          </div>
          <div className={styles.CartOrderSummary_deliveryInfo}>
            <Skeleton className={styles.skeleton_label} />
            <Skeleton className={styles.skeleton_value} />
          </div>
          <div className={styles.CartOrderSummary_divider}></div>
          <div className={styles.CartOrderSummary_totalPriceContainer}>
            <Skeleton className={styles.skeleton_label_sm} />
            <Skeleton className={styles.skeleton_value} />
          </div>
        </div>
      </div>
    </div>
  )
}
// Footer skeleton
function FooterSkeleton() {
  return (
    <div className={styles.cart_bag_footer}>
      <div className={styles.subtotal_section}>
        <Skeleton className={styles.skeleton_label_sm} />
        <Skeleton className={styles.skeleton_value} />
      </div>
      <div className={styles.button_section}>
        <Skeleton className={styles.skeleton_button} />
      </div>
    </div>
  )
}
function CartBag({ toggleCartBag, updateCartCount }: CartBagProps) {
  const client = new Client()
  const [deliveryRange, setDeliveryRange] = useState("")
  const [cartCount, setCartCount] = useState<number>(0)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [formKey, setFormKey] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [cartSubTotal, setCartSubTotal] = useState<number>(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  // Close on click outside
  // Handle localStorage sync via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (typeof window === "undefined") return
      if (e.key === "cartCount") {
        const count = e.newValue ? parseInt(e.newValue) : 0
        setCartCount(count)
        updateCartCount(count)
      }
      if (e.key === "showcartBag" && e.newValue === "true") {
        // Auto-open the cart (assumes cart is closed when adding from PDP; toggles to open)
        // If cart is already open, this would close it—consider adding state checks if needed
        toggleCartBag()
        localStorage.removeItem("showcartBag")
      }
    }

    // Initial load from localStorage
    const initialCount = localStorage.getItem("cartCount")
    if (initialCount && parseInt(initialCount) > 0) {
      setCartCount(parseInt(initialCount))
      updateCartCount(parseInt(initialCount))
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        toggleCartBag()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [toggleCartBag, updateCartCount])
  // Delivery range
  useEffect(() => {
    const today = new Date()
    const addDays = (days: number) => {
      const date = new Date(today)
      date.setDate(date.getDate() + days)
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    }
    setDeliveryRange(`${addDays(3)} - ${addDays(11)}`)
  }, [])
  // Fix: Use correct env var (Next.js public vars must start with NEXT_PUBLIC_)
  const baseURL = process.env.baseURL || ""
  const getProductDetails = async (item: any) => {
    try {
      const product = await client.fetchProductBySKU(item.sku)
      const productData = product?.data?.products?.items?.[0]
      return productData || null
    } catch (err) {
      console.error("Failed to fetch product details for SKU:", item.sku)
      return null
    }
  }
  const fetchCartItems = useCallback(async () => {
    setIsLoading(true)
    // If no base URL, show empty (or mock for dev)
    if (!baseURL) {
      setIsLoading(false)
      return
    }
    try {
      const response = await fetch(`${baseURL}fcprofile/sync/index`, {
        method: "GET",
        credentials: "include", // Important for session/auth
      })
      if (!response.ok) throw new Error("Failed to fetch cart")
      const data = await response.json()
      if (data?.cart_items) {
        const itemPromises = data.cart_items.map(async (item: any) => {
          const newItem = { ...item }
          const details = await getProductDetails(item)
          if (details) {
            newItem.name = details.name
            newItem.sku = details.sku
            newItem.image_url = details.image?.url || ""
            newItem.url_key = details.url_key || ""
          }
          return newItem
        })
        const cartItemsList = await Promise.all(itemPromises)
        setCartItems(cartItemsList)
        setFormKey(data.form_key || "")
        updateCartCount(data.cart_qty || cartItemsList.length)
        setCartCount(data.cart_qty || 0)
      }
    } catch (err) {
      console.error("Cart sync failed:", err)
      setCartItems([])
      updateCartCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [baseURL, updateCartCount])
  useEffect(() => {
    fetchCartItems()
  }, [fetchCartItems])
  // Subtotal calculation
  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + item.price * (item.qty || 1)
    }, 0)
    setCartSubTotal(subtotal)
  }, [cartItems])
  // Delete item handler
  const deleteItem = async (cartItem: CartItem) => {
    setDeletingItemId(cartItem.item_id)
    try {
      const response = await fetch(`${baseURL}fcprofile/cart/next`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: parseInt(cartItem.entity_id),
          form_key: formKey,
        }),
      })
      if (response.ok) {
        await fetchCartItems() // Refetch to stay in sync
      } else {
        setCartItems((prev) => prev.filter((item) => item.item_id !== cartItem.item_id))
      }
    } catch (err) {
      console.error("Delete failed:", err)
      setCartItems((prev) => prev.filter((item) => item.item_id !== cartItem.item_id))
    } finally {
      setDeletingItemId(null)
    }
  }
  // Checkout handler with loading state
  const handleCheckout = () => {
    setIsCheckoutLoading(true)
    setTimeout(() => {
      window.location.href = `${baseURL}checkout/`
    }, 800)
  }
  // Shop redirect handler
  const handleShopRedirect = () => {
    toggleCartBag()
  }
  // Prevent body scroll when cart is open
  useEffect(() => {
    document.body.classList.add("body-no-scroll")
    return () => document.body.classList.remove("body-no-scroll")
  }, [])
  return (
    <div className={styles.cart_bag_outer}>
      <div ref={wrapperRef} className={styles.cart_bag}>
        {/* Header */}
        <div className={styles.cart_bag_close}>
          <Image
            onClick={toggleCartBag}
            width={24}
            height={24}
            src="/Images/cross-23-32.png"
            alt="Close Cart"
            className="cursor-pointer"
          />
          <h3>My Cart</h3>
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
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {(cartCount > 0 || isLoading) && (
              <span className={styles.cartCountNumber}>{isLoading ? "—" : cartCount}</span>
            )}
          </span>
        </div>
        {/* Loading State - Skeleton */}
        {isLoading && (
          <>
            <div className={styles.cart_bag_content}>
              <CartItemSkeleton />
              <CartItemSkeleton />
              <CartItemSkeleton />
              <OrderSummarySkeleton />
            </div>
            <FooterSkeleton />
          </>
        )}
        {/* Has Items */}
        {!isLoading && cartItems.length > 0 && (
          <>
            <div className={styles.cart_bag_content}>
              {cartItems.map((item, index) => (
                <div
                  className={`${styles.cart_item_outer} ${
                    deletingItemId === item.item_id ? styles.cart_item_deleting : ""
                  }`}
                  key={'cart_' + item.item_id + '_' + index}
                  id={item.item_id}
                >
                  <div className={styles.cart_item}>
                    <div className={styles.item_thumbnail}>
                      {item.image_url && (
                        <Link href={`/${item.url_key?.replace("/product", "").replace(/^\//, "") || ""}`}>
                          <Image
                            width={120}
                            height={120}
                            src={
                              item.image_url.includes("cache")
                                ? item.image_url.replace(/\/cache\/.*?\//, "/")
                                : item.image_url
                            }
                            alt={item.name || "Product"}
                            className={styles.item_image}
                          />
                        </Link>
                      )}
                    </div>
                    <div className={styles.item_detail}>
                      <Link href={`/${item.url_key?.replace("/product", "").replace(/^\//, "") || ""}`} className={styles.item_name}>
                        {item.name}
                      </Link>
                      <p className={styles.item_sku}><strong>SKU:</strong> {item.sku}</p>
                    </div>
                    <button
                      className={`${styles.delete_icon} ${
                        deletingItemId === item.item_id ? styles.delete_icon_loading : ""
                      }`}
                      onClick={() => !deletingItemId && deleteItem(item)}
                      disabled={!!deletingItemId}
                      aria-label="Remove item"
                    >
                      {deletingItemId === item.item_id ? (
                        <Spinner size={20} />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className={styles.comboPriceQua}>
                    <div className={styles.custom_quantity}>
                      <p><b>Quantity:</b> {item.qty || 1}</p>
                    </div>
                    <p className={styles.item_price}>
                      <strong>{getFormattedCurrency(item.price * (item.qty || 1))}</strong>
                    </p>
                  </div>
                </div>
              ))}
              {/* Order Summary */}
              <div className={styles.Order_CartOrderSummary_wrapper}>
                <h3>Cart Order Summary</h3>
                <div className={styles.CartOrderSummary_wrapper}>
                  <div className={styles.CartOrderSummary_container}>
                    <div className={styles.CartOrderSummary_totalPriceContainer}>
                      <div>Subtotal ({cartItems.length} Item{cartItems.length > 1 ? 's' : ''})</div>
                      <span className={styles.CartOrderSummary_subTotalValue}>{getFormattedCurrency(cartSubTotal)}</span>
                    </div>
                    <div className={styles.CartOrderSummary_deliveryInfo}>
                      <div>Shipping</div>
                      <div className={styles.CartOrderSummary_deliveryAmount}>Delivery Charges if applicable</div>
                    </div>
                    <div className={styles.CartOrderSummary_deliveryInfo}>
                      <div>Estimated Delivery:</div>
                      <div className={styles.CartOrderSummary_deliveryEstimate}>{deliveryRange}</div>
                    </div>
                    <div className={styles.CartOrderSummary_divider}></div>
                    <div className={styles.CartOrderSummary_totalPriceContainer}>
                      <div className={styles.CartOrderSummary_totalPrice}>Total</div>
                      <span className={styles.CartOrderSummary_totalValue}>{getFormattedCurrency(cartSubTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className={styles.cart_bag_footer}>
              <div className={styles.subtotal_section}>
                <p>Subtotal</p>
                <p>{getFormattedCurrency(cartSubTotal)}</p>
              </div>
              <div className={styles.button_section}>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                  className={`${styles.buy_now} ${isCheckoutLoading ? styles.buy_now_loading : ""}`}
                >
                  {isCheckoutLoading ? (
                    <>
                      <Spinner size={20} />
                      <span className={styles.checkout_text}>Processing...</span>
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
        {/* Empty State */}
        {!isLoading && cartItems.length === 0 && (
          <div className={styles.cart_empty}>
            <div className={styles.cart_empty_inner}>
              <Image
                src="/Images/emptyCart.png"
                alt="Empty Cart"
                width={150}
                height={150}
              />
              <h3>Your Cart is Empty</h3>
              <p>Add some items to your cart to see them here.</p>
              <button onClick={handleShopRedirect} className={styles.shop_button}>
                Start Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default CartBag