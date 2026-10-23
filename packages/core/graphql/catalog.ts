// All product types per magento/magento2 defaults. Vertical + sample-data agnostic.
export const PRODUCT_CARD_FRAGMENT = `fragment Card on ProductInterface { sku name url_key __typename stock_status price_range { minimum_price { regular_price { value currency } final_price { value currency } } } small_image { url label } }`;
export const PDP_QUERY = `${PRODUCT_CARD_FRAGMENT}
query Pdp($urlKey: String!) {
  products(filter: { url_key: { eq: $urlKey } }) {
    items {
      ...Card
      description { html } short_description { html } meta_title meta_description canonical_url
      stock_status
      media_gallery { url label position disabled }
      categories { name url_path level }
      ... on SimpleProduct { stock_status }
      ... on ConfigurableProduct { configurable_options { attribute_code label values { uid label value_index swatch_data { value } } } variants { product { sku stock_status media_gallery { url label position disabled } price_range { minimum_price { regular_price { value currency } final_price { value currency } } } } attributes { code value_index } } }
      ... on BundleProduct { items { title options { label quantity } } }
      ... on GroupedProduct { items { product { sku name } qty } }
      ... on DownloadableProduct { downloadable_product_links { title price } }
      ... on VirtualProduct { stock_status }
    }
  }
}`;
export const CATEGORY_QUERY = `query Cat($id: String!) {
  categories(filters: { url_path: { eq: $id } }) { items { uid name description breadcrumbs { category_name category_url_path } } }
}`;
// Category listing with layered navigation. `facets` = aggregations for the category alone
// (all options stay visible while filtering); `products` = the filtered, sorted page.
export const PLP_QUERY = `${PRODUCT_CARD_FRAGMENT}
query Plp($base: ProductAttributeFilterInput!, $filter: ProductAttributeFilterInput!, $sort: ProductAttributeSortInput, $pageSize: Int!, $page: Int!) {
  facets: products(filter: $base, pageSize: 1) { aggregations { attribute_code label options { label value count } } }
  products(filter: $filter, sort: $sort, pageSize: $pageSize, currentPage: $page) {
    total_count
    page_info { current_page total_pages }
    items { ...Card }
  }
}`;
// Homepage data in one round trip. categoryList with no filter resolves to the
// store's own root category, so no hardcoded root id and multi-store stays correct.
export const HOME_QUERY = `${PRODUCT_CARD_FRAGMENT}
query Home($cmsId: String!, $carouselSize: Int!) {
  categoryList { children { uid name url_path image product_count include_in_menu } }
  products(search: "", pageSize: $carouselSize) { items { ...Card } }
  cmsBlocks(identifiers: [$cmsId]) { items { identifier content } }
}`;
// Header/footer data: menu tree (store root, 2 levels), branding, store switcher list.
export const SHELL_QUERY = `query Shell {
  categoryList { children { uid name url_path include_in_menu position children { uid name url_path include_in_menu position } } }
  storeConfig { store_code store_name copyright secure_base_media_url header_logo_src logo_alt }
  availableStores { store_code store_name }
}`;
export const CMS_QUERY =`query Cms($id: String!) { cmsPage(identifier: $id) { title content_heading content } }`;
export const STORES_QUERY = `query Stores { storeConfig { store_name base_currency_code locale } availableStores { store_code store_name } currency { base_currency_code available_currency_codes } }`;
export const REVIEWS_QUERY = `query Rev($sku: String!) { products(filter: { sku: { eq: $sku } }) { items { reviews(pageSize: 10, currentPage: 1) { items { nickname summary text created_at average_rating ratings_breakdown { name value } } } review_count rating_summary } } }`;
export const CREATE_REVIEW_MUTATION = `mutation Write($sku: String!, $nick: String!, $sum: String!, $text: String!, $ratings: [ProductReviewRatingInput!]!) {
  createProductReview(input: { sku: $sku, nickname: $nick, summary: $sum, text: $text, ratings: $ratings }) { review { nickname summary } }
}`;
// Values included: option IDs differ per store. Never assume 1-5.
export const RATINGS_QUERY = `query Meta { productReviewRatingsMetadata { items { id name values { value_id value } } } }`;
export const FORGOT_MUTATION = `mutation Forgot($email: String!) { requestPasswordResetEmail(email: $email) }`;
