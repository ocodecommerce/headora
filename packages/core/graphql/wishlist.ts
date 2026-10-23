// Customer wishlist (needs the customer bearer token). First wishlist only, like Magento Open Source.
const WISHLIST_FIELDS = `id items_v2(pageSize: 100) { items { id product { sku } } }`;
export const WISHLIST_QUERY = `query Wishlist { customer { wishlists { ${WISHLIST_FIELDS} } } }`;
export const ADD_TO_WISHLIST_MUTATION = `mutation AddWish($id: ID!, $sku: String!) {
  addProductsToWishlist(wishlistId: $id, wishlistItems: [{ sku: $sku, quantity: 1 }]) { wishlist { ${WISHLIST_FIELDS} } user_errors { code message } }
}`;
export const REMOVE_FROM_WISHLIST_MUTATION = `mutation RemoveWish($id: ID!, $itemId: ID!) {
  removeProductsFromWishlist(wishlistId: $id, wishlistItemsIds: [$itemId]) { wishlist { ${WISHLIST_FIELDS} } user_errors { code message } }
}`;
