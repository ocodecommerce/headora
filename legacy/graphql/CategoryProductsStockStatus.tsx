const CategoryProductsStockStatus = (urlPath:any, currentPage:any ) => `

query {
  categoryList(filters: { url_key: { eq: "${urlPath}" } }) {
    products(pageSize: 21, currentPage: ${currentPage}) {
      total_count
      page_info {
        total_pages
        page_size
        current_page
      }
      items {
        name
      stock_status
                   
        }
      }
    }
}
  `
  export default CategoryProductsStockStatus