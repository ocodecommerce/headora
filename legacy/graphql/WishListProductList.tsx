
const GET_WISHLIST_PRODUCT_LIST = `
query getCustomerWishlists {
  customer {
    wishlists {
      id
      items_count
      items_v2 {
        items {
          id
          quantity
          product {
            name
            sku
            url_key
          }
        }
      }
    }
  }
}

`;
export default GET_WISHLIST_PRODUCT_LIST