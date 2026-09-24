const ReviewRating = (SKU:any,
                      NickName:any,
                      Summary:any,
                      Text:any,
                      QualityLabel:any, 
                      QualityValue:any, 
                      ValueLabel:any, 
                      ValueValue:any,
                      PriceLabel:any,
                      PriceValue:any ) => `
                                            mutation {
                                              createProductReview(
                                                input: {
                                                  sku: "${SKU}",
                                                  nickname: "${NickName}",
                                                  summary: "${Summary}",
                                                  text: "${Text}",
                                                  
                                                  ratings: [
                                                    {
                                                      id: "${QualityLabel}",           # Quality
                                                      value_id: "${QualityValue}"      # Value 4 (for example)
                                                    },
                                                    {
                                                      id: "${ValueLabel}",           # Value
                                                      value_id: "${ValueValue}"      # Value 3
                                                    },
                                                    {
                                                      id: "${PriceLabel}",           # Price
                                                      value_id: "${PriceValue}"      # Value 4
                                                    }
                                                  ]
                                                }
                                            ) {
                                                review {
                                                  nickname
                                                  summary
                                                  text
                                                  average_rating
                                                  ratings_breakdown {
                                                    name
                                                    value
                                                  }
                                                }
                                              }
                                            }
                                            `
export default ReviewRating
