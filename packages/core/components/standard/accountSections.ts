// Same sections (and order) as Venia's account menu; Saved Payments / Store Credit are not offered.
export const ACCOUNT_SECTIONS = [
  { slug: "order-history", label: "Order History" },
  { slug: "wishlist", label: "Favorites" },
  { slug: "address-book", label: "Address Book" },
  { slug: "communications", label: "Communications" },
  { slug: "account-information", label: "Account Information" },
] as const;
