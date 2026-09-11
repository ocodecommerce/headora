const fetchSubCategoryByURL = (urlKey: any, currentPage: number) => `
query {
  categoryList(filters: { url_path: { eq: "${urlKey}" } }) {
    name
    uid
    url_key
    url_path
    description

    image

    meta_title         
    meta_keywords    
    meta_description 
    display_mode
    
    products(pageSize: 21, currentPage: ${currentPage}) {
      total_count
      page_info {
        total_pages
        page_size
        current_page
      }
      
      items {
        id
        name
        sku
        url_key
          __typename
        image {
          url
        }
          manufacturer
        price {
          regularPrice {
            amount {
              value
              currency
            }
          }
        }
                    price_range {
  maximum_price{
    regular_price{
      value
       currency
    }
    final_price{
      value
       currency
    }
  }
  minimum_price {
    final_price {
      value
       currency
    }
    regular_price {
      value
       currency
    }
  }
}

        # Adding the ConfigurableProduct fragment here
        ... on ConfigurableProduct {
           configurable_options {
          id
          attribute_id_v2
          attribute_code
          values {
            label
            value_index
            swatch_data {
              value
            }
          }
            
        }
          variants {
            attributes {
              code
              label
              value_index
            }
            product {
              id
              sku
              name
              description {
                html
              }
              short_description {
                html
              }
              price_range {
                maximum_price {
                  final_price {
                    value
                    currency
                  }
                  regular_price {
                    value
                    currency
                  }
                }
              }
              image {
                url
              }
            
              media_gallery {
                url
                label
              }
            }
          }
        }
      }
    }
  }
}

    `

export default fetchSubCategoryByURL