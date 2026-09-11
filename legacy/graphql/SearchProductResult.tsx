const SearchProductResult = (text:any,currentPage:any) => `

query {
    products(
      search: "${text}",
      pageSize: 21,
      currentPage: ${currentPage}


       ) {
    total_count
    page_info {
      total_pages
      page_size
      current_page    
    }
    sort_fields {
      options {
        label
        value
      }
    } 
    aggregations {
      label
      options {
        count
        label
        value
      }
    }
    items {
  
      categories {
        name
        uid
        description
        url_key
        url_path
      }
      uid
      url_key
      url_path
      id
      name
      sku
      image {
        url
      }
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
  ... on SimpleProduct {
        # Example of custom attributes
      
   price {
        regularPrice {
          amount {
            value
            currency
          }
        }
      }
 			
      }
     	__typename
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
      ... on CustomizableProductInterface {
        options {
          title
          sort_order
          required
        }
      }
    }
  }
}

`;
export default SearchProductResult;