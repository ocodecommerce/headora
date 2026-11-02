// Customer account (Venia-style My Account): profile, orders, addresses, favourites, newsletter.
const ADDRESS = `id firstname lastname street city postcode telephone country_code default_shipping default_billing region { region region_code region_id }`;
const MONEY = `value currency`;

export const NAME_QUERY = `query Me { customer { firstname } }`;
export const ACCOUNT_QUERY = `query Account {
  customer {
    firstname lastname email is_subscribed
    addresses { ${ADDRESS} }
    orders(pageSize: 20, sort: { sort_field: CREATED_AT, sort_direction: DESC }) {
      total_count
      items {
        number order_date status
        total { grand_total { ${MONEY} } subtotal { ${MONEY} } total_shipping { ${MONEY} } }
        items { id product_name product_sku quantity_ordered product_sale_price { ${MONEY} } selected_options { label value } }
        shipping_address { firstname lastname street city postcode country_code region }
        shipping_method
        payment_methods { name }
      }
    }
    wishlists { id items_v2(pageSize: 50) { items { id product { sku name url_key __typename stock_status small_image { url } price_range { minimum_price { regular_price { ${MONEY} } final_price { ${MONEY} } } } } } } }
  }
  countries { id full_name_locale available_regions { id code name } }
}`;
export const UPDATE_CUSTOMER_MUTATION = `mutation Update($input: CustomerUpdateInput!) { updateCustomerV2(input: $input) { customer { firstname lastname is_subscribed } } }`;
export const CHANGE_PASSWORD_MUTATION = `mutation Pw($current: String!, $next: String!) { changeCustomerPassword(currentPassword: $current, newPassword: $next) { email } }`;
export const CREATE_ADDRESS_MUTATION = `mutation AddAddress($input: CustomerAddressInput!) { createCustomerAddress(input: $input) { id } }`;
export const UPDATE_ADDRESS_MUTATION = `mutation EditAddress($id: Int!, $input: CustomerAddressInput!) { updateCustomerAddress(id: $id, input: $input) { id } }`;
export const DELETE_ADDRESS_MUTATION = `mutation DeleteAddress($id: Int!) { deleteCustomerAddress(id: $id) }`;
export const REVOKE_TOKEN_MUTATION = `mutation Revoke { revokeCustomerToken { result } }`;
