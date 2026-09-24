const fetchCategoriesQuery = `
query {
  categories {
    items {
      uid
      name
      image
      product_count
      children {
        uid
        name
        url_key
        url_path
        image
        product_count
        children {
          uid
          name
          url_key
          url_path
          image
          product_count
          children {
            uid
            name
            url_key
            url_path
            image
            product_count
          }
        }
      }
    }
  }
}

`;
export default fetchCategoriesQuery