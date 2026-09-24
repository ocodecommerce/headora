const fetchSearch = (text: any, currentPage: any) => `
query {
  products(
    search: "${text}",
    pageSize: 20,
    currentPage: ${currentPage}
  ) {
    total_count
    page_info {
      total_pages
      page_size
      current_page    
    }
    items {
      url_path
      url_key
      id
      name
      sku
      image {
        url
      }
    }
  }
  
  categories(filters: { name: { match: "${text}" } }) {
    items {
      id
      name
      url_path
      url_key
      children_count
    }
  }
}
`
export default fetchSearch;
