// All product types per magento/magento2 defaults. Vertical + sample-data agnostic.
export const PRODUCT_CARD_FRAGMENT = `fragment Card on ProductInterface { sku name url_key __typename price_range { minimum_price { regular_price { value currency } final_price { value currency } } } small_image { url label } }`;
export const PDP_QUERY = `query Pdp($urlKey: String!) {
  products(filter: { url_key: { eq: $urlKey } }) {
    items {
      ...Card
      description { html } short_description { html } meta_title meta_description canonical_url
      ... on SimpleProduct { stock_status }
      ... on ConfigurableProduct { configurable_options { attribute_code label values { uid label swatch_data { value } } } variants { product { sku } attributes { code value_index } } }
      ... on BundleProduct { items { title options { label quantity } } }
      ... on GroupedProduct { items { product { sku name } qty } }
      ... on DownloadableProduct { downloadable_product_links { title price } }
      ... on VirtualProduct { stock_status }
    }
  }
}`;
export const CATEGORY_QUERY = `query Cat($id: String!) {
  categories(filters: { category_url_path: { eq: $id } }) { items { name description products(pageSize: 24) { items { ...Card } } } }
}`;
export const STORES_QUERY = `query Stores { storeConfig { store_name base_currency_code locale } availableStores { store_code store_name } currency { base_currency_code available_currency_codes } }`;
export const REVIEWS_QUERY = `query Rev($sku: String!) { products(filter: { sku: { eq: $sku } }) { items { reviews(pageSize: 10) { items { nickname summary text created_at average_rating ratings_breakdown { name value } } } review_count rating_summary } } }`;
export const CREATE_REVIEW_MUTATION = `mutation Write($sku: String!, $nick: String!, $sum: String!, $text: String!, $ratings: [ProductReviewRatingInput!]!) {
  createProductReview(input: { sku: $sku, nickname: $nick, summary: $sum, text: $text, ratings: $ratings }) { review { nickname summary } }
}`;
export const RATINGS_QUERY = `query Meta { productReviewRatingsMetadata { items { id name } } }`;
