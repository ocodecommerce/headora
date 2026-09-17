const productsDetail = `
  id
  name
  sku
  url_key
  meta_title        
  meta_keyword
  meta_description 
  description{
    html
  }
`


export const fetchProductDetailURLKey = (urlKey: any) => `
query {
  products(filter: { url_key: { eq: "${urlKey}" } }) {
aggregations {
  attribute_code
          label
          count
          options {
            count
            label
            value
          }
    } 
          total_count
    items {
    manufacturer
      name
			sku
   		url_key
      url_suffix
    canonical_url
      stock_status
      categories {
        url_key
        position
        name
      }
      __typename
    }
    items {
  ${productsDetail}
  special_price
      price_range {
  maximum_price{
    regular_price{
      value
    }
    final_price{
      value
    }
  }
  minimum_price {
    final_price {
      value
    }
    regular_price {
      value
    }
  }
}
      categories {
        name
        id
        url_key
        breadcrumbs {
          category_id
          category_name
        }
      }
               reviews {
        items {
          text
          created_at
          nickname
					summary
					average_rating
         ratings_breakdown {
                name
                value
          }
        }
      }
 			__typename
  ... on CustomizableProductInterface {
        options {
          title
          required
          
        }
      }
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
      attributes{
      code
      label
      value_index
    }
          product {
          ${productsDetail}
            price_range {
             maximum_price{
              regular_price{
                value
              }
              final_price{
                value
              }
              }
            }
            image{
              url
            }
           
            media_gallery {
              url
              label
              
            }
          }
        }
      }
         
      
      description{
        html
      }
        short_description{
        html
      }
      uid

      media_gallery{
        position
        url
        label
      }
        related_products{
  
      uid
      url_key
      id
      name
      sku
      image {
        url
      }
      media_gallery {
        url
        label
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
     
        	__typename
        
      }

          upsell_products{
       uid
              url_key
              id
              name
              sku
            image {
                url
                  }
            media_gallery {
            url
            label
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
     
        	__typename
          }
       crosssell_products {
     uid
              url_key
              id
              name
              sku
            image {
                url
                  }
            media_gallery {
            url
            label
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

        	__typename
    }
      image{
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
      }
    }
  }`