// Headless guest checkout (standard preset): address -> shipping method -> offline payment -> place order.
const CHECKOUT_FIELDS = `email is_virtual total_quantity
  items { uid quantity product { name sku small_image { url } } prices { row_total { value currency } }
    ... on ConfigurableCartItem { configurable_options { option_label value_label } configured_variant { small_image { url } } } }
  shipping_addresses {
    firstname lastname street city postcode telephone region { region_id label } country { code }
    available_shipping_methods { carrier_code method_code carrier_title method_title available amount { value currency } }
    selected_shipping_method { carrier_code method_code amount { value currency } }
  }
  available_payment_methods { code title }
  selected_payment_method { code }
  prices { subtotal_excluding_tax { value currency } grand_total { value currency } applied_taxes { amount { value currency } } }`;

export const CHECKOUT_QUERY = `query Checkout($id: String!) { cart(cart_id: $id) { ${CHECKOUT_FIELDS} } }`;
export const COUNTRIES_QUERY = `query Countries { countries { id full_name_locale available_regions { id code name } } }`;
const ADDRESS_STEPS = `setShippingAddressesOnCart(input: { cart_id: $id, shipping_addresses: [{ address: $address }] }) { cart { email } }
  setBillingAddressOnCart(input: { cart_id: $id, billing_address: { same_as_shipping: true } }) { cart { ${CHECKOUT_FIELDS} } }`;
export const ADDRESS_MUTATION = `mutation Address($id: String!, $email: String!, $address: CartAddressInput!) {
  setGuestEmailOnCart(input: { cart_id: $id, email: $email }) { cart { email } }
  ${ADDRESS_STEPS}
}`;
// Customer cart: Magento already knows the email.
export const CUSTOMER_ADDRESS_MUTATION = `mutation Address($id: String!, $address: CartAddressInput!) { ${ADDRESS_STEPS} }`;
// Default (or first) saved address, to prefill a signed-in checkout.
export const SAVED_ADDRESS_QUERY = `query Saved { customer { addresses { firstname lastname street city postcode telephone country_code default_shipping region { region region_id } } } }`;
export const SHIPPING_METHOD_MUTATION = `mutation Ship($id: String!, $carrier: String!, $method: String!) {
  setShippingMethodsOnCart(input: { cart_id: $id, shipping_methods: [{ carrier_code: $carrier, method_code: $method }] }) { cart { ${CHECKOUT_FIELDS} } }
}`;
export const PLACE_ORDER_MUTATION = `mutation Place($id: String!, $code: String!) {
  setPaymentMethodOnCart(input: { cart_id: $id, payment_method: { code: $code } }) { cart { selected_payment_method { code } } }
  placeOrder(input: { cart_id: $id }) { order { order_number } }
}`;
