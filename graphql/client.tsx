
import IOSAppPage from "@/pages/ios-app";
import AuthenticityPromise from "./AuthenticityPromise";
import BitPayTerms from "./BitPayTerms";
import fetchCategoriesQuery from "./categories";
import GET_CMS_PAGE from "./cmsPage";
import fetchCollectionByURL from "./Collection_URL_Key";
import fetchProductBySKU from "./fetchProductBySKU";
import FooterCMS from "./FooterCMS";
import GET_GLOSSARY_PAGE from "./GlossaryCMS";
import fetchProductdetailallURLKey from "./ProductDetail";
import GET_RETURNS_PAGE from "./Returns";
import ReviewRating from "./ReviewRating";
import ReviewsAllValues from "./ReviewsAllValues";
import fetchSearch from "./Search";
import SearchProductResult from "./SearchProductResult";
import GET_CMS_SHIPPING_PAGE from "./ShippingPage";
import GET_CMS_SIZE_AND_FIT_PAGE from "./SizeAndFitPage";
import fetchSSGCategoriesQuery from "./ssrCategory";
import fetchSubCategory from "./SubCategory";
import fetchSubCategoryByURL from "./SubCategory_URL_Key";
import TopRibbon from "./TopRibbonCMS";
import GET_WATCHES_WARRANTY_PAGE from "./watchesWarrantycms";
import IOSApp from "./IOSApp";
import StockStatus from "./StockStatus";
import FETCH_SELL_OLD_USED_JEWELRY_WACHES_ONLINE_PAGE from "./FetchSellOldUsedJewelryWatchesOnlineData";
import PDPReturnCMSBlock from "./PDPReturnCMSBlock";
import CategoryProductsStockStatus from "./CategoryProductsStockStatus";
import CategoryFilterProductResult from "./CategoryFilterProductResult";
import GET_CMS_CONSIGNMENT_TERMS from "./ConsignmentTermsPage";
import GET_CMS_PRIVACY_POLICY_PAGE from "./PrivacyPolicy";
import GET_CMS_TERMS_OF_SERVICE_PAGE from "./TermsOfService";
import NOT_FOUND_PAGE_CSM from "./NotFoundPage";
import GET_CMS_PRESS_PAGE from "./PressPage";
import GET_CMS_OUR_STORY_PAGE from "./OurStory";
import GET_WISHLIST_MUTATION from "./WishlistMutation";
import GET_WISHLIST_PRODUCT_LIST from "./WishListProductList";
import GET_WISHLIST_ID from "./GetWishListID";
import REMOVE_WISHLIST_MUTATION from "./RemoveWishlistMutation";
import fetchMegaMenuQuery from "./MegaMenu";
import {fetchProductDetailURLKey} from "./ProductDetail_URL_Key"

export class Client {



    async generateCustomerToken(email: string, password: string) {
        try {
          const response = await fetch(`${process.env.magentoEndpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                mutation GenerateCustomerToken($email: String!, $password: String!) {
                  generateCustomerToken(email: $email, password: $password) {
                    token
                  }
                }
              `,
              variables: {
                email,
                password,
              },
            }),
          });
      
          if (response.ok) {
            const data = await response.json();
      
            // Magento returns errors inside the JSON even with 200 status
            if (data.errors?.length) {
              throw new Error(data.errors[0].message || "Login failed");
            }
      
            return data; // { data: { generateCustomerToken: { token: "..." } } }
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error: any) {
          console.error("generateCustomerToken error:", error);
          throw error; // re-throw so the UI can show the message
        }
      }
      
      async createCustomerV2(input: {
        firstname: string;
        lastname: string;
        email: string;
        password: string;
        is_subscribed?: boolean;
      }) {
        try {
          const response = await fetch(`${process.env.magentoEndpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                mutation CreateCustomerV2($input: CustomerCreateInput!) {
                  createCustomerV2(input: $input) {
                    customer {
                      firstname
                      lastname
                      email
                    }
                  }
                }
              `,
              variables: {
                input: {
                  firstname: input.firstname,
                  lastname: input.lastname,
                  email: input.email,
                  password: input.password,
                  // uncomment if your Magento schema supports it
                  // is_subscribed: input.is_subscribed ?? false,
                },
              },
            }),
          });
      
          if (response.ok) {
            const data = await response.json();
      
            if (data.errors?.length) {
              throw new Error(data.errors[0].message || "Could not create account");
            }
      
            return data; // { data: { createCustomerV2: { customer: {...} } } }
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error: any) {
          console.error("createCustomerV2 error:", error);
          throw error;
        }
      }





    async fetchCategories() {
        try {

            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: fetchCategoriesQuery }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };



    async fetchMegaMenu() {
        try {

            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: fetchMegaMenuQuery }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };


    async fetchBoutiqueCategories() {
        try {

            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                     
                },
                body: JSON.stringify({ query: fetchCategoriesQuery }),
            });
            
            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                return response

            }
        } catch (error) {

            return "Error"
        }
    };

    async fetchCMSPages() {
        try {
            const identifier = "home";
            const query = GET_CMS_PAGE(identifier); 
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query}),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };
    async fetchBouitqueCMSPages() {
        try {
            const identifier = "home-page-boutique";
            const query = GET_CMS_PAGE(identifier); 
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query}),
            });
            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };

    
    async fetchTermsOfServiceCMSPages() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_CMS_TERMS_OF_SERVICE_PAGE }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };
    async fetchPrivacyPolicyCMSPages() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_CMS_PRIVACY_POLICY_PAGE }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };
    
    async fetchShippingCMSPages() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_CMS_SHIPPING_PAGE }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };
    async fetchPressCMSPages() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_CMS_PRESS_PAGE }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };
    
    async fetchConsignmentTermsCMSPages() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_CMS_CONSIGNMENT_TERMS }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };
    async fetchSizeAndFitCMSPages() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_CMS_SIZE_AND_FIT_PAGE }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };

    
    async fetchReturnsCMSPages() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_RETURNS_PAGE }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };
    
    async fetchSellOldUsedJewelryWatchesOnline() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: FETCH_SELL_OLD_USED_JEWELRY_WACHES_ONLINE_PAGE }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };
     async fetchNotFoundPage(){
    try {
      const response = await fetch(`${process.env.magentoEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          
        },
        body: JSON.stringify({ query: NOT_FOUND_PAGE_CSM }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        // Handle errors
      }
    } catch (error) {
      return "Error";
    }
  }
    async fetchGlossaryCMSPages() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_GLOSSARY_PAGE }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };

    
    async fetchWatchWarrantyCMSPages() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_WATCHES_WARRANTY_PAGE }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };


    async fetchProductDetailsAllUrl(currentPage:number){
        try {
            const query = fetchProductdetailallURLKey(currentPage); 
             
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };

    async fetchProductDetail(urlKey:any){
        try {
            const query = fetchProductDetailURLKey(urlKey); 

            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
            console.log(error,"error")
            return "Error"
        }
    };
    async fetchOurStoryCMSPages() {
        try {
          const response = await fetch(`${process.env.magentoEndpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              
            },
            body: JSON.stringify({ query: GET_CMS_OUR_STORY_PAGE }),
          });
    
    
          if (response.ok) {
            const data = await response.json();
            return data;
          } else {
            // Handle errors
          }
        } catch (error) {
          return "Error";
        }
      }

    async fetchAllReviewValue(){
        try {
         
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: ReviewsAllValues}),
            });
          
            if (response.ok) {
                const data = await response.json();
                return data.data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };

    async fetchCollectionPage(urlKey:any){
        try {
            const query = fetchCollectionByURL(urlKey); 
             
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };

   async fetchboutiqueCollectionPage(urlKey:any){
        try {
            const query = fetchCollectionByURL(urlKey); 
             
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                     
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };

    async fetchTopRibbion(){
        try {
         
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: TopRibbon}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data.data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };
   async fetchPDPReturnCMSBlock(){
        try {
         
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: PDPReturnCMSBlock}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };
    async fetchSubCategoryDataByUrlKey(urlKey:any, currentPage: number){
        try {
            const query = fetchSubCategoryByURL(urlKey,currentPage); 
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                   
                },
                body: JSON.stringify({ query}),
            });
             //console.log(response,'response')
            if (response.ok) {
                const data = await response.json();
                return data.data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };

    
    async fetchSubCategoryDataByUrlKeyForBoutique(urlKey:any, currentPage: number){
        try {
            const query = fetchSubCategoryByURL(urlKey,currentPage); 
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                       
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data.data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };
    async fetchSubCategoryData(uid:any,currentPage: number){
        try {
            const query = fetchSubCategory(uid, currentPage); 
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data.data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };

    async fetchboutiqueSubCategoryData(uid:any,currentPage: number){
        try {
            const query = fetchSubCategory(uid, currentPage); 
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                     
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data.data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };

    async fetchProductBySKU(urlKey:any){
        try {
            const query = fetchProductBySKU(urlKey); 
           
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };

    async fetchSSGSubCategoryData(){
        try {
            const query = fetchSSGCategoriesQuery(); 
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data.data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };   
    async fetchSearchResult(text:any,currentPage: number){
        try {
            const query = fetchSearch(text, currentPage); 
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {

                
                const responsedata = await response.json();
                return responsedata.data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };
    async fetchFooterCMS(){
        try {
         
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: FooterCMS}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data.data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    };
    async fetchCategoryFilterProductResult(text: any, currentPage: any, filter: any,sorting:any ) {
        try {
            const query = CategoryFilterProductResult(text, currentPage, filter,sorting ); 
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {

                
                const responsedata = await response.json();
                return responsedata.data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    } 

    async fetchSearchProductResult(text: any, currentPage: any, ) {
        try {
            const query = SearchProductResult(text, currentPage); 
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {

                
                const responsedata = await response.json();
                return responsedata.data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    } 
    
    async fetchReviewSection(
        SKU:any,
        NickName:any,
        Summary:any,
        Text:any,
        QualityLabel:any, 
        QualityValue:any, 
        ValueLabel:any, 
        ValueValue:any,
        PriceLabel:any,
        PriceValue:any
    ){
        try {
            const query = ReviewRating(SKU,NickName,Summary,Text,QualityLabel,QualityValue,ValueLabel,ValueValue,PriceLabel,PriceValue); 
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query}),
            });
             
            if (response.ok) {

                
                const responsedata = await response.json();
                return responsedata.data
            } else {
                // Handle errors
                 
            }
        } catch (error) {
             
            return "Error"
        }
    } 

    async fetchAuthenticityPromisePage() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: AuthenticityPromise }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };

    async fetchIosAppPage() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: IOSApp }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };
        
    async fetchStockStatus(urlKry: any) {
        try {
            const query = StockStatus(urlKry); 
    
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }), 
            });
    
             ;
            
            if (response.ok) {
                const data = await response.json();
                return data.data;
            } else {
                // Handle errors
                 
                return null; // Return null or handle it as needed
            }
        } catch (error) {
             
            return "Error";
        }
    }
    async fetchCategoryProductsStockStatus(urlPath: any, currentPage: number) {
        
        try {
            const query = CategoryProductsStockStatus(urlPath, currentPage); 
    
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }), 
            });
  
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                // Handle errors
                 
                return null; // Return null or handle it as needed
            }
        } catch (error) {
             
            return "Error";
        }
    }
    
     async fetchRemoveWishlistMutation(wishlistID: number, itemID: number) {
        
        try {
            const query = REMOVE_WISHLIST_MUTATION(wishlistID, itemID); 
    
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }), 
            });
  
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                // Handle errors
                 
                return null; // Return null or handle it as needed
            }
        } catch (error) {
             
            return "Error";
        }
    }
     async fetchWishlistMutation(sku: any, wishlistID: number) {
        
        try {
            const query = GET_WISHLIST_MUTATION(sku, wishlistID); 
    
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }), 
            });
  
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                // Handle errors
                 
                return null; // Return null or handle it as needed
            }
        } catch (error) {
             
            return "Error";
        }
    }
    async fetchWishListID() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_WISHLIST_ID }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };
     async fetchWishListProductsList() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: GET_WISHLIST_PRODUCT_LIST }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };
    async fetchBitpayTermsPage() {
        try {
            const response = await fetch(`${process.env.magentoEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: BitPayTerms }),
            });

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                // Handle errors

            }
        } catch (error) {

            return "Error"
        }
    };
}
