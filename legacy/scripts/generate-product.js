const fs = require("fs");
const path = require("path");
import { Client } from "@/graphql/client";

async function generateProduct() {
  const client = new Client();
  let currentPage = 1;
  let totalPages = 1;
  let allProducts = [];

  // Fetch all product data
  while (currentPage <= totalPages) {
    const urlData = await client.fetchProductDetailsAllUrl(currentPage);
    totalPages = urlData?.data?.products?.page_info?.total_pages || 1;
    currentPage++;

    const products = urlData?.data?.products?.items || [];
    allProducts = [...allProducts, ...products];
  }

  // Ensure the directory exists
  const productDir = path.resolve(__dirname, "../cacheM/product");
  if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, { recursive: true });
  }

  // Save each product's data as a JSON file
  for (const product of allProducts) {
    const productData = await client.fetchProductDetail(product.url_key);
    const reviews = await client.fetchAllReviewValue() || null;

    let productsResult = productData.data.products || null;
    let { filters, optionValueMap } = await createFiltersFromAggregations(productsResult.aggregations);
    let configuredProducts = await createProductsFromMagProducts(productsResult.items, filters, optionValueMap);
    const productDetails = configuredProducts[0] || null;

    if (productDetails) {
      const productFilePath = path.join(productDir, `${product.url_key}.json`);
      fs.writeFileSync(productFilePath, JSON.stringify({ 
        productData: productDetails,
        aggregations: productsResult.aggregations || [],
        reviews: reviews,
      }, null, 2));
    }
  }

  //console.log("✅ All product JSON files have been generated successfully.");
}

generateProduct();
