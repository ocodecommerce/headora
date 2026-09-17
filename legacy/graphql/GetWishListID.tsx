
const GET_WISHLIST_ID = `
query GetWishListID  {
  customer {
    wishlist {
      id
      items_count
    }
  }
}
`;
export default GET_WISHLIST_ID