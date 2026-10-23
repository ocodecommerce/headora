// Guest cart (masked cart id). Configurable items are added by parent SKU + selected option uids.
const CART_FIELDS = `total_quantity
  prices { subtotal_excluding_tax { value currency } }
  items {
    uid quantity
    product { sku name url_key small_image { url label } }
    prices { row_total { value currency } }
    ... on ConfigurableCartItem { configurable_options { option_label value_label } configured_variant { sku small_image { url } } }
  }`;
export const CREATE_CART_MUTATION = `mutation NewCart { createEmptyCart }`;
export const CART_QUERY = `query Cart($id: String!) { cart(cart_id: $id) { ${CART_FIELDS} } }`;
export const ADD_TO_CART_MUTATION = `mutation Add($id: String!, $items: [CartItemInput!]!) {
  addProductsToCart(cartId: $id, cartItems: $items) { cart { ${CART_FIELDS} } user_errors { code message } }
}`;
export const REMOVE_FROM_CART_MUTATION = `mutation Remove($id: String!, $uid: ID!) {
  removeItemFromCart(input: { cart_id: $id, cart_item_uid: $uid }) { cart { ${CART_FIELDS} } }
}`;
