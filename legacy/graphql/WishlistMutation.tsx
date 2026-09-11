
const GET_WISHLIST_MUTATION = (sku: any, wishlistID: number) =>`
mutation {
  addProductsToWishlist(
    wishlistId: ${wishlistID}
    wishlistItems: [{ sku: "${sku}", quantity: 1 }]
  ) {
    wishlist {
      id
      items_count
      items_v2 {
        items {
          id
          product {
            name
            sku
          }
          quantity
        }
      }
    }
  }
}
`;
export default GET_WISHLIST_MUTATION