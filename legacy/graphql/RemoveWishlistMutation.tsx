
const REMOVE_WISHLIST_MUTATION = ( wishlistID: number, itemID:number) =>`
mutation {
  removeProductsFromWishlist(
    wishlistId: "${wishlistID}"
    wishlistItemsIds: ["${itemID}"]
  ) {
    wishlist {
      id
      items {
        id
        product {
          name
        }
      }
    }
  }
}
`;
export default REMOVE_WISHLIST_MUTATION