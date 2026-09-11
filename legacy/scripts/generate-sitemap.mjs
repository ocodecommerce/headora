//const fs = require('fs');
import fs from 'fs/promises';  
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createHash } from 'crypto';

//const path = require('path');

const deployOptionsFilepath = path.resolve(`./deployOptions.json`);
const BASE_URL = process.env.baseURLWithoutTrailingSlash || 'https://headora.ocodecommerce.com'; 

const MAGENTO_ENDPOINT = process.env.MAGENTO_ENDPOINT || "gql-username";
const MAGENTO_KEY = process.env.MAGENTO_KEY || "username";
const MAGENTO_PASSWORD = process.env.MAGENTO_PASSWORD || "none";
const MAX_URLS_PER_SITEMAP = 5000;   // Add this line
const getToday = () => new Date().toISOString();
// .split('T')[0];
const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const IMAGE_NAMESPACE = 'http://www.google.com/schemas/sitemap-image/1.1';

const getAuthHeader = () => ({
  'gql-username': MAGENTO_PASSWORD,
});

import { createFiltersFromAggregations, createProductsFromMagProducts } from '../components/ConfigureProduct.js';

const staticSitemapContent = () => {
  const today = getToday();
return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/authenticity-promise/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
    <url>
    <loc>${BASE_URL}/bitpay-terms/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
   <url>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
};

// Static content for sitemap.xml
const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/index-sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/cat-sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/prod-sitemap.xml</loc>
  </sitemap>
</sitemapindex>`;

// Function to write static index-sitemap.xml
function writeStaticSitemap() {
  const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const outputDir = path.resolve(__dirname, '../public');

    if (!fs.access(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFile(path.join(outputDir, 'index-sitemap.xml'), staticSitemapContent(), 'utf8');
}
function writeSitemapIndex() {
  const today = getToday();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outputDir = path.resolve(__dirname, '../public');

  let indexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap>
  <loc>${BASE_URL}/index-sitemap.xml</loc>
  <lastmod>${today}</lastmod>
</sitemap>\n`;

  // Add all category sitemaps
  if (global.categorySitemapFiles && global.categorySitemapFiles.length > 0) {
      global.categorySitemapFiles.forEach(filename => {
          indexContent += `  <sitemap>
  <loc>${BASE_URL}/${filename}</loc>
  <lastmod>${today}</lastmod>
</sitemap>\n`;
      });
  }

  // Add all product sitemaps
  if (global.productSitemapFiles && global.productSitemapFiles.length > 0) {
      global.productSitemapFiles.forEach(filename => {
          indexContent += `  <sitemap>
  <loc>${BASE_URL}/${filename}</loc>
  <lastmod>${today}</lastmod>
</sitemap>\n`;
      });
  }

  indexContent += `</sitemapindex>`;
  if (!fs.access(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
    }
  fs.writeFile(path.join(outputDir, 'sitemap.xml'), indexContent, 'utf8');

  const totalFiles = (global.categorySitemapFiles?.length || 0) + (global.productSitemapFiles?.length || 0);
  console.log(`✓ sitemap.xml index created with ${totalFiles} total sitemap files`);
}

InitSiteMap();

// Async function to handle writing dynamic and static sitemaps
async function InitSiteMap() {
    try {

      await ensureCacheDirectory();
      let deployType='';
      let pageUrls=[]
        try{
        let deployOptions = JSON.parse(await fs.readFile(deployOptionsFilepath, 'utf-8'));
        deployType=deployOptions.type
        pageUrls=deployOptions.pageUrls.split(",");
        }catch(e){
          
        }
        pageUrls.forEach(async(slug)=>{
            const urlPath = slug.replace(/\.html$/, '')
            const cacheStaticProps = createHash('md5')
              .update(urlPath + '.html')
              .digest('hex');
              const cachePaths = [
                path.resolve(`./cacheM/category/${cacheStaticProps}.json`),
                path.resolve(`./cacheM/product/${cacheStaticProps}.json`),
                path.resolve(`./cacheM/static/${urlPath}.json`)
              ];
              if(slug=='home'){
                cachePaths.push(path.resolve(`./cacheM/static/${urlPath}_1.json`))
                cachePaths.push(path.resolve(`./cacheM/static/${urlPath}_2.json`))
              }

              for (const filePath of cachePaths) {
                try {
                  await fs.access(filePath); // ✅ Check existence
                  await fs.unlink(filePath); // ✅ Delete
                } catch (err) {
                  
                }
              }
        });

          // Inside InitSiteMap() function, at the end:
          await productsSitemapToFile(deployType, pageUrls); 
          await categorySitemapToFile(deployType);

          // Write static and index
          writeStaticSitemap();
          writeSitemapIndex();   // This must come AFTER productsSitemapToFile

    } catch (error) {
        console.error('Error:', error);
    }
}



function generateSiteMap(data) {
    const urls = data
        .map(({ url, priority }) => `
      <url>
        <loc>${`${url}`}</loc>
        <changefreq>weekly</changefreq>
        <priority>${priority}</priority>
      </url>
    `)
        .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;
}


async function fetchCategories() {
 const fetchSSGCategoriesQuery = `
query {
  categories{ 
  items{
    product_count
    url_path
    children{
     product_count
     url_path
     children{
      product_count
      url_path
       children{
        product_count
        url_path
}
  }

  }
  }
}
}
`;
    try {
        const response = await fetch(`${BASE_URL}/graphql/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
...getAuthHeader(),
            },
            body: JSON.stringify({
                query: fetchSSGCategoriesQuery,
            }),
        });

        if (response.ok) {
          const data = await response.json();
            return data.data.categories.items[0];
        } else {
          let errorText = "";
            try {
              // Try reading JSON response (GraphQL usually returns JSON)
              const errJson = await response.json();
              errorText = JSON.stringify(errJson, null, 2);
            } catch (jsonError) {
              // Fallback: plain text error
              errorText = await response.text();
            }

            
            console.log(`❌ Graphql Error:`, errorText);
            console.log(`❌ Graphql Query:`, fetchSSGCategoriesQuery);
            throw new Error('Failed to fetch data');
        }
    } catch (error) {
    }
}

async function fetchBTCategories() {
  const fetchSSGCategoriesQuery = `
 query {
   categories{ 
   items{
     product_count
     url_path
     children{
      product_count
      url_path
      children{
       product_count
       url_path
        children{
         product_count
         url_path
 }
   }
 
   }
   }
 }
 }
 `;
     try {
         const response = await fetch(`${BASE_URL}/graphql/`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
...getAuthHeader(),
                    'Store': 'boutique'
             },
             body: JSON.stringify({
                 query: fetchSSGCategoriesQuery,
             }),
         });
 
         if (response.ok) {
           const data = await response.json();
             return data.data.categories.items[0];
         } else {
          let errorText = "";
            try {
              // Try reading JSON response (GraphQL usually returns JSON)
              const errJson = await response.json();
              errorText = JSON.stringify(errJson, null, 2);
            } catch (jsonError) {
              // Fallback: plain text error
              errorText = await response.text();
            }

            
            console.log(`❌ Graphql Error:`, errorText);
            console.log(`❌ Graphql Query:`, fetchSSGCategoriesQuery);
             throw new Error('Failed to fetch data');
         }
     } catch (error) {
          
     }
}
 
 // Helper function to ensure cache directory exists
async function ensureCacheDirectory() {
  const cacheDir = path.resolve('./cacheM');
  const cacheCatDir = path.resolve('./cacheM/category');
  const cacheProDir = path.resolve('./cacheM/product');
  const cacheStaDir = path.resolve('./cacheM/static');

   
  try {
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.mkdir(cacheCatDir, { recursive: true });
    await fs.mkdir(cacheProDir, { recursive: true });
    await fs.mkdir(cacheStaDir, { recursive: true });
   
  } catch (error) {
    console.error('Error ensuring cache directory:', error);
  }
}

async function categorySitemapToFile(deployType) {
  if (deployType !== 'complete_application' && deployType !== 'all_categories') {
      return; // or handle 'by_page_urls' if needed
  }

  let categories = await fetchCategories(); // your existing function (or fetchBTCategories if boutique)

  let allCategoryUrls = [];        // For sitemap generation
  let topLevelCategoriesPath = [];
  let secondLevelCategoriesPath = [];
  let thirdLevelCategoriesPath = [];

  if (categories?.children) {
      const processCategory = (cat, level = 1) => {
          if (cat.product_count > 0) {
              const url = `${BASE_URL}/${cat.url_path}.html`;
              const cleanPath = `${cat.url_path}.html`;

              allCategoryUrls.push({
                  url,
                  priority: level === 1 ? 0.9 : 0.8,   // Top level slightly higher priority
                  lastmod: new Date().toISOString()    // or fetch real updated_at if available
              });

              if (level === 1) topLevelCategoriesPath.push(cleanPath);
              else if (level === 2) secondLevelCategoriesPath.push(cleanPath);
              else if (level === 3) thirdLevelCategoriesPath.push(cleanPath);
          }

          if (cat.children) {
              cat.children.forEach(sub => processCategory(sub, level + 1));
          }
      };

      categories.children.forEach(cat => processCategory(cat));
  }

  // ==================== SPLIT INTO MULTIPLE SITEMAPS (same as products) ====================
  const totalCategories = allCategoryUrls.length;
  const numSitemaps = Math.ceil(totalCategories / MAX_URLS_PER_SITEMAP);

  console.log(`Total categories: ${totalCategories} → Creating ${numSitemaps} category sitemaps`);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outputDir = path.resolve(__dirname, '../public');
  await fs.mkdir(outputDir, { recursive: true });

  const categorySitemapFiles = [];

  for (let i = 0; i < numSitemaps; i++) {
      const start = i * MAX_URLS_PER_SITEMAP;
      const end = Math.min(start + MAX_URLS_PER_SITEMAP, totalCategories);
      const chunk = allCategoryUrls.slice(start, end);

      const sitemapContent = generateCategorySiteMap(chunk);
      const sitemapFilename = numSitemaps === 1 
          ? 'cat-sitemap.xml' 
          : `cat-sitemap-${i + 1}.xml`;

      await fs.writeFile(
          path.join(outputDir, sitemapFilename),
          sitemapContent,
          'utf8'
      );

      categorySitemapFiles.push(sitemapFilename);
      console.log(`✓ Created ${sitemapFilename} (${chunk.length} category URLs)`);
  }

  // Save cache files (your existing logic)
  const topLevelFile = path.resolve('./cacheM/topLevelCategoriesPath.json');
  const filteredTop = topLevelCategoriesPath.filter(item => item !== 'brands.html');
  await fs.writeFile(topLevelFile, JSON.stringify(filteredTop, null, 2));

  await fs.writeFile(
      path.resolve('./cacheM/secondLevelCategoriesPath.json'),
      JSON.stringify(secondLevelCategoriesPath, null, 2)
  );

  await fs.writeFile(
      path.resolve('./cacheM/thirdLevelCategoriesPath.json'),
      JSON.stringify(thirdLevelCategoriesPath, null, 2)
  );

  // Make it available globally for sitemap index
  global.categorySitemapFiles = categorySitemapFiles;

  console.log(`✓ Category sitemaps completed (${categorySitemapFiles.length} files)`);
}

function generateCategorySiteMap(data) {
  const urls = data
      .map(({ url, priority = 0.8, lastmod }) => {
          let xml = `
  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>`;

          if (lastmod) {
              xml += `\n      <lastmod>${lastmod}</lastmod>`;
          }

          xml += `\n    </url>`;
          return xml;
      })
      .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${SITEMAP_NAMESPACE}">
${urls}
</urlset>`;
}


function generateProductSiteMap(data) {
  const urls = data
      .map(({ url, lastmod, imageUrl, name }) => {
          let xml = `
    <url>
      <loc>${url}</loc>`;
          
          if (lastmod) {
              xml += `\n        <lastmod>${lastmod}</lastmod>`;
          }

          // Image extension (highly recommended for your luxury/NFT products)
          if (imageUrl) {
              xml += `
      <image:image>
        <image:loc>${imageUrl}</image:loc>
        <image:title>${name ? name.replace(/&/g, '&amp;').replace(/</g, '&lt;') : ''}</image:title>
      </image:image>`;
          }

          xml += `\n      </url>`;
          return xml;
      })
      .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${SITEMAP_NAMESPACE}"
      xmlns:image="${IMAGE_NAMESPACE}">
  ${urls}
</urlset>`;
}


const fetchProductsQuery = (currentPage = 1) => `
query {
  products(filter: { }
  pageSize:1000
  currentPage:${currentPage},
 ) {
    page_info{
    page_size
      total_pages
      current_page
    }
    items{
      url_key
      sku
      updated_at
      created_at
      name
        image {
        url
      }
    }
    }
  }`;

async function fetchAllProducts(currentPage) {
    try {
        const query = fetchProductsQuery(currentPage)
        const response = await fetch(`${BASE_URL}/graphql/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
...getAuthHeader(),
            },
            body: JSON.stringify({ query }),
        });

        if (response.ok) {
            const data = await response.json();
            return data?.data?.products || { items: [], page_info: {} };
        } else {
            let errorText = "";
            try {
              // Try reading JSON response (GraphQL usually returns JSON)
              const errJson = await response.json();
              errorText = JSON.stringify(errJson, null, 2);
            } catch (jsonError) {
              // Fallback: plain text error
              errorText = await response.text();
            }

            
            console.log(`❌ Graphql Error:`, errorText);
            console.log(`❌ Graphql Query:`, query);
            return { items: [], page_info: {} };
        }
    } catch (error) {

    }
}

async function productsSitemapToFile(deployType, pageUrls) {
  
  if (deployType === 'complete_application' || deployType === 'all_products') {
      
      let allUrls = [];           // All product URL objects for sitemap
      let allProductsPath = [];
      let allSearchProducts = [];

      let currentPage = 1;
      let totalPages = 1;
      
      while (currentPage <= totalPages) {
        const fetchPages = [...Array(5).keys()]
          .map(offset => currentPage + offset)
          .filter(page => page <= totalPages)
          .map(page => fetchAllProducts(page));

        const pageResults = await Promise.all(fetchPages);
        
        for (const pageData of pageResults) {
          if (pageData && pageData.items?.length > 0) {
            await processProductsInBatches(pageData.items);
            totalPages = pageData.page_info?.total_pages || totalPages;

            pageData.items.forEach(product => {
              allProductsPath.push(product.url_key + '.html');

              let imageUrl = product?.image?.url || 
                            (product?.media_gallery && product.media_gallery.length > 0 
                              ? product.media_gallery[0].url 
                              : null);

                              if (imageUrl && imageUrl.includes('placeholder')) {
                                imageUrl = null;
                              }

              if (imageUrl?.includes("/cache/")) {
                imageUrl = imageUrl.replace(/\/cache\/.*?\//, '/');
              }

              allSearchProducts.push({
                name: product.name,
                url_key: product.url_key,
                image_url: imageUrl,
                sku: product.sku
              });

              allUrls.push({
                priority: 0.7,
                url: `${BASE_URL}/${product.url_key}.html`,
                name: product.name,
                url_key: product.url_key,
                image_url: imageUrl,
                lastmod : product.updated_at
                ? new Date(product.updated_at.replace(' ', 'T') + 'Z').toISOString()
                : product.created_at
                  ? new Date(product.created_at.replace(' ', 'T') + 'Z').toISOString()
                  : undefined
              });
            });
          }
        }
        currentPage += fetchPages.length;
      }

        // ==================== SPLIT INTO MULTIPLE SITEMAPS ====================
        const totalProducts = allUrls.length;
        const numSitemaps = Math.ceil(totalProducts / MAX_URLS_PER_SITEMAP);

        console.log(`Total products: ${totalProducts} → Creating ${numSitemaps} product sitemaps`);

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const outputDir = path.resolve(__dirname, '../public');

        await fs.mkdir(outputDir, { recursive: true });

        const productSitemapFiles = [];

        for (let i = 0; i < numSitemaps; i++) {
          const start = i * MAX_URLS_PER_SITEMAP;
          const end = Math.min(start + MAX_URLS_PER_SITEMAP, totalProducts);
          const chunk = allUrls.slice(start, end);

          // Prepare data with lastmod and image
          const enrichedChunk = chunk.map((item, index) => {
            // const originalProduct = pageData?.items?.[index] || {}; // Approximate mapping
            return {
              url: item.url,
              lastmod: item.lastmod,
              imageUrl: item.image_url || '',
              name: item.name || '',
            };
          });

          const sitemapContent = generateProductSiteMap(enrichedChunk);
          const sitemapFilename = `prod-sitemap-${i + 1}.xml`;
          
          await fs.writeFile(
            path.join(outputDir, sitemapFilename), 
            sitemapContent, 
            'utf8'
          );

          productSitemapFiles.push(sitemapFilename);
          console.log(`✓ Created ${sitemapFilename} (${chunk.length} URLs)`);
        }

        // Save cache files
        const allProductsPathFile = path.resolve(`./cacheM/allProductsPath.json`);
        await fs.writeFile(allProductsPathFile, JSON.stringify(allProductsPath, null, 2));

        const allSearchProductsFile = path.resolve(`./cacheM/allSearchProducts.json`);
        await fs.writeFile(allSearchProductsFile, JSON.stringify(allSearchProducts, null, 2));

        global.productSitemapFiles = productSitemapFiles;

  } 
  else if (deployType === 'by_page_urls' && pageUrls.length > 0) {
      // Your existing code for by_page_urls remains unchanged
      const items = [];
      const promises = pageUrls.map(async (slug) => {
        // ... (keep your existing by_page_urls logic here)
      });
      // ... rest of your existing else if block
  }
}

async function processProductsInBatches(items) {
  for (let i = 0; i < items.length; i += 20) {
      const batch = items.slice(i, i + 20);

      await Promise.all(
          batch.map(async (item) => {
            const cacheUrlKeyFileName = createHash('md5')
              .update(item.url_key + '.html')
              .digest('hex');
              const cacheUrlKeyFilePath = path.resolve(`./cacheM/product/${cacheUrlKeyFileName}.json`);
                try {
                    await fs.access(cacheUrlKeyFilePath);
                    let cachedItem = JSON.parse(
                      await fs.readFile(cacheUrlKeyFilePath, "utf-8")
                    );

                    cachedItem.props = cachedItem.props || {};
                    cachedItem.props.productData = cachedItem.props.productData || {}

                    if (!cachedItem.props.productData.updated_at) {
                        cachedItem.props.productData.updated_at = item.updated_at;
                        await fs.writeFile(
                          cacheUrlKeyFilePath,
                          JSON.stringify(cachedItem, null, 2),
                          "utf-8"
                        );
                    } 
                    
                    if (item.updated_at === cachedItem.props.productData.updated_at) {
                      console.log('Generating Product '+item.sku+' From cache\n')
                      return;
                    }
                } catch (error) {
                   
                }

              await getProductDetails(item.sku);
          })
      );
  }
}




const productsDetail = `
  id
  name
  sku
  url_key
  updated_at
  meta_title        
  meta_keyword
  meta_description 
  description{
    html
  }
`;
const fetchProductDetailURLKey = (productSKU) => `
query {
  products(filter: { sku: { eq: "${productSKU}" } }) {
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
      updated_at
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
        level
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
async function getProductDetails(productSKU) {
  console.log('Generating Product '+productSKU+' From server\n')
  const query = fetchProductDetailURLKey(productSKU); 
  try {
      const response = await fetch(`${BASE_URL}/graphql/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
...getAuthHeader(),
          },
          body: JSON.stringify({ query}),
      });
        
      if (response.ok) {
      const data = await response.json();
      if (data?.data?.products?.items?.length > 0) {
          let productsData = JSON.parse(JSON.stringify(data.data.products));
          let pageData = await getProducts(productsData);

          if (!pageData?.product) {
              return null;
          }

          const productData = pageData.product|| null;;
          const aggregations = pageData.aggregations|| [];
          const reviews = await fetchAllReviewValue() || null
          const ReturnDataCMSBlock = await fetchPDPReturnCMSBlock() || null; 
     

          let returnData={
            props: {
              productData,
              aggregations,
              reviews,
              ReturnDataCMSBlock,  
              view:'product',
              urlPath:pageData.product.url_key + '.html' 
            },
          }


          // Generate hash-based filenames
          const cacheUrlKeyFileName = createHash('md5')
              .update(pageData.product.url_key + '.html')
              .digest('hex')
              // .slice(0, 12);
              const __filename = fileURLToPath(import.meta.url);
              const __dirname = dirname(__filename);

           // Assuming `cacheUrlKeyFileName` is the unique file name (like 'de55f792d634')
              const prooutputDir = path.resolve(__dirname, `../cacheM/product/${cacheUrlKeyFileName}.json`);

              // Check if the directory exists, create it if not
              const dirPath = path.dirname(prooutputDir);
              try {
                  await fs.mkdir(dirPath, { recursive: true });
              } catch (error) {
                  console.log('Error creating directory:', error);
              }

              try {
                  await fs.writeFile(prooutputDir, JSON.stringify(returnData));
                
              } catch (error) {
                 
              }
          return returnData;
      } else {
          return null;
      }
      }else{
            let errorText = "";
            try {
              const errJson = await response.json();
              errorText = JSON.stringify(errJson, null, 2);
            } catch (jsonError) {
              errorText = await response.text();
            }
            console.log(`❌ Graphql Error:`, errorText);
            console.log(`❌ Graphql Query:`, query);
            return null;
    }
  } catch (error) {
      console.log(`❌ Graphql Error: fetching product details for SKU: ${productSKU}`, error);
      console.log(`❌ Graphql Query:`, query);
      return null;
  }
}

async function fetchPDPReturnCMSBlock(){
        try {
          const PDPReturnCMSBlock =`query {
          cmsBlocks(identifiers: "pdp-return-policy") {
              items {
                identifier
                title
                content
              }
            }
          }`
         const response = await fetch(`${BASE_URL}/graphql/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
...getAuthHeader(),
                },
                body: JSON.stringify({ query: PDPReturnCMSBlock}),
            });
             
            if (response.ok) {
                const data = await response.json();
                return data
            } else {
            let errorText = "";
            try {
              // Try reading JSON response (GraphQL usually returns JSON)
              const errJson = await response.json();
              errorText = JSON.stringify(errJson, null, 2);
            } catch (jsonError) {
              // Fallback: plain text error
              errorText = await response.text();
            }
            console.log(`❌ Graphql Error:`, errorText);
            console.log(`❌ Graphql Query:`, PDPReturnCMSBlock);
            }
        } catch (error) {
             console.log(`❌ Graphql Error:`, error.message);
             return "Error"
        }
    };


async function fetchAllReviewValue(){

  

    try {
        const ReviewsAllValues = `
         query {
         productReviewRatingsMetadata {
         items {
        id
        name
        values {
          value_id
          value
        }
      }
    }
  }
    `
            const response = await fetch(`${BASE_URL}/graphql/`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
...getAuthHeader(),
              },
              body: JSON.stringify({ query: ReviewsAllValues}),
          });
            if (response.ok) {
                const data = await response.json();
                return data.data
            } else {
              let errorText = "";
            try {
              // Try reading JSON response (GraphQL usually returns JSON)
              const errJson = await response.json();
              errorText = JSON.stringify(errJson, null, 2);
            } catch (jsonError) {
              // Fallback: plain text error
              errorText = await response.text();
            }

            
            console.log(`❌ Graphql Error:`, errorText);
            console.log(`❌ Graphql Query:`, ReviewsAllValues);
              return []
                 
            }
        } catch (error) {
             
          return []
        }
}


async function getProducts(productsResult) {
  let responseData = {};  // Fix: Use an object instead of an array

  try {
      const aggregationsList = productsResult.aggregations || [];
      let { filters, optionValueMap } = await createFiltersFromAggregations(aggregationsList);
      let configuredProducts = await createProductsFromMagProducts(productsResult.items, filters, optionValueMap);
      const productData = configuredProducts[0] || null;
      const aggregations = productsResult.aggregations || [];
    
      
      responseData.product = {
          ...productData,  // Spread existing product details
          magData: productsResult.items[0],
          aggregations: aggregations
      };

      return responseData;
  } catch (error) {
      console.error("Error processing products:", error);
      return { error: "Failed to process product data", product: null };
  }
}

async function getCustomAttributes(aggregations, urlKey) {
  try {
      if (!aggregations || aggregations.length === 0) {
          console.warn("No aggregations provided.");
          return {};
      }

      // Extract attribute codes (excluding 'price' and 'category_id')
      const attributeCodes = aggregations
          .filter(attr => attr.attribute_code !== "price" && attr.attribute_code !== "category_id")
          .map(attr => attr.attribute_code)
          .join(", ");

      if (!attributeCodes) {
          console.warn("No valid attributes to fetch.");
          return {};
      }

      // Construct GraphQL query
      const attributesQuery = `
          query { 
              products(filter: {sku: {eq: "${urlKey}"}}) { 
                  items { ${attributeCodes} } 
              } 
          }`;

      // Fetch data from Magento
      const response = await client.query({
          query: gql`${attributesQuery}`
      });

      // Extract product attributes
      return response?.data?.products?.items?.[0] || {};
  } catch (error) {
      console.error(`Error fetching custom attributes for ${urlKey}:`, error);
      return {};
  }
}






