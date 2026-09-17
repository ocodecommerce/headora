const fetchProductBySKU = (sku: any) => `query {
  products(filter: { sku: { eq: "${sku}" } }) {
  items {
        sku
        name
        image{
            url
        }
      }
    }
  }`
export default fetchProductBySKU