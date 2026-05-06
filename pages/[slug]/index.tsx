import CategoriesProducts from '@/components/Category/CategoriesProducts'
import CategoryHeader from '@/components/Category/CategoryHeader'
import Content from '@/components/Category/Content'
import CollectionBreadCrumbs from '@/components/Collection/CollectionBreadCrumbs'
import CollectionContent from '@/components/Collection/CollectionContent'
import CollectionHeader from '@/components/Collection/CollectionHeader'
import CollectionListing from '@/components/Collection/CollectionListing'
import CollectionReletatedProducts from '@/components/Collection/CollectionReletatedProducts'
import SubCollectionListing from '@/components/Collection/SubCollectionListing'
import { Client } from '@/graphql/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect ,useState} from 'react'
import CrossSellProducts from '@/components/ProductDetail/CrossSellProducts'
import UpSellProducts from '@/components/ProductDetail/UpSellProducts'
import StaticReview from '@/components/ProductDetail/StaticReview'

import ProductDetail from '../../components/ProductDetail/ProductDetail';
import ReviewSection from '../../components/ProductDetail/ReviewSection';

import ReletedProducts from '../../components/ProductDetail/ReletedProducts';


import { createFiltersFromAggregations, createProductsFromMagProducts } from '../../components/ConfigureProduct';
import fs from 'fs/promises';
  import path from 'path';
  import { createHash } from 'crypto';
import RelatedBrands from '@/components/ProductDetail/RelatedBrands'
// Define the types for the collection data
interface CollectionProps {
  collection: {
    name: string;
    description?: string;
    [key: string]: any;
  };
}


// ==================== SCHEMA COMPONENTS ====================

// 1. Collection / Category Schema
const CategorySchema = ({ category, url }: any) => {
  if (!category) return null;
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category?.meta_title || category?.name,
    "description": category?.meta_description || "",
    "image": category?.image || "",
    "url": `${process.env.baseURLForSchema}/${url}/`,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />;
};

// 2. BreadcrumbList Schema
const BreadcrumbSchema = ({ breadcrumbs }: any) => {
  if (!breadcrumbs?.length) return null;
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb?.name,
      "item": `${process.env.baseURLForSchema}${breadcrumb?.path}/`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }} />;
};

// 3. Product Schema for each product
const CategoryProductSchema = ({ products }: any) => {
  if (!products?.length) return null;

  const schemaList = products.map((product: any) => {
    const mainImage = product.image?.url || product.media_gallery?.[0]?.url || "";
    const price = product.price_range?.minimum_price?.regular_price?.value || product.price?.regularPrice?.value || 0;
    const currency = product.price_range?.minimum_price?.regular_price?.currency || product.price?.regularPrice?.currency || "USD";
    const availability = product.stock_status === "IN_STOCK" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "sku": product.sku,
      "image": mainImage,
      "description": product.description || "",
      "category": product.categories?.map((cat: any) => cat.name).join(" > ") || "",
      "url": `${process.env.baseURLForSchema}/${product.url_key}/`,
      "offers": {
        "@type": "Offer",
        "url": `${process.env.baseURLForSchema}/${product.url_key}/`,
        "price": price,
        "priceCurrency": currency,
        "availability": availability,
      },
    };
  });

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaList) }} />;
};





// ============================Product Schema Component======================================
// ================== Product Schema ==================
const ProductSchema = ({ product, aggregations, schemaImage, price, metaDiscription }: any) => {
  if (!product) return null;

  // ✅ Extract Brand
  const getBrandName = () => {
    const brandAttr =
      aggregations?.find((a: any) => a.attribute_code === "br_1_brand") ||
      aggregations?.find((a: any) => a.attribute_code === "brand");
    return brandAttr?.options?.[0]?.label || "Headora";
  };

  // ✅ Extract Category Breadcrumbs (for Google hierarchy)
  const categories = product?.categories || [];
  const categoryPath = categories.map((c: any) => c?.name).join(" > ");

  // ✅ Collect Product Images
  const images =
    product?.media_gallery?.map((img: any) => img?.url) ||
    (product?.image?.url ? [product?.image?.url] : []);

  // ✅ Extract Attributes for extra details
  const getAttr = (code: string) => {
    const attr = aggregations?.find((a: any) => a.attribute_code === code);
    return attr?.options?.map((opt: any) => opt?.label) || [];
  };

  const material = getAttr("br_1_case_material")[0] || getAttr("br_1_band_material")[0];
  const color = getAttr("br_1_dial_color")[0];
  const features = getAttr("br_1_features");

  // ✅ Rating & Reviews
  const reviews = product?.reviews?.items || [];
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum: number, r: any) => sum + (r?.average_rating || 0), 0) /
          reviews.length) /
        20
      : null;

  const aggregateRating =
    averageRating !== null
      ? {
          "@type": "AggregateRating",
          ratingValue: averageRating.toFixed(1),
          reviewCount: reviews.length,
          bestRating: "5",
          worstRating: "1",
        }
      : undefined;

  const reviewSchema =
    reviews.length > 0
      ? reviews.map((r: any) => ({
          "@type": "Review",
          name: r?.summary || "Customer Review",
          reviewBody: r?.text || "",
          reviewRating: {
            "@type": "Rating",
            ratingValue: (r?.average_rating / 20).toFixed(1),
            bestRating: "5",
            worstRating: "1",
          },
          datePublished: r?.created_at || undefined,
          author: {
            "@type": "Person",
            name: r?.nickname || "Anonymous",
          },
        }))
      : undefined;

  // ✅ Offers (Price + Stock)
  const offerPrice = price || product?.price?.regularPrice?.amount?.value || product?.price_range?.minimum_price?.final_price?.value;
  const offerCurrency = product?.price?.regularPrice?.amount?.currency || "USD";

  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  const offer = {
    "@type": "Offer",
    url: `${process.env.baseURLForSchema}/${product?.url_key}/`,
    priceCurrency: offerCurrency,
    price: offerPrice,
    availability:
      product?.stock_status === "OUT_OF_STOCK"
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    priceValidUntil: oneYearLater.toISOString(),
    seller: {
      "@type": "Organization",
      name: "Headora", // TODO: set actual store name
    },
  };

  // ✅ Schema Data
  const schemaData: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product?.meta_title || product?.name,
    sku: product?.sku,
    mpn: product?.sku,
    gtin13: product?.gtin || undefined, // TODO: add GTIN/EAN/UPC if available
    description: metaDiscription || product?.meta_description || product?.short_description || "",
    url: `${process.env.baseURLForSchema}/${product?.url_key}/`,
    image: images,
    brand: {
      "@type": "Brand",
      name: getBrandName(),
    },
    category: categoryPath || undefined,
    ...(material && { material }),
    ...(color && { color }),
    ...(features?.length > 0 && { additionalProperty: features.map((f: string) => ({ "@type": "PropertyValue", name: "Feature", value: f })) }),
    offers: offer,
    ...(aggregateRating && { aggregateRating }),
    ...(reviewSchema && { review: reviewSchema }),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
  );
};



// ==========================================Static Paths =======================================

export const getStaticPaths: GetStaticPaths = async () => {


  const client = new Client();
  const allCategoriesPathFile = path.resolve(`./cacheM/topLevelCategoriesPath.json`);
  const allProductsPathFile = path.resolve(`./cacheM/allProductsPath.json`);
  try {
    let allCategories= JSON.parse(await fs.readFile(allCategoriesPathFile, 'utf-8'));
    let allProducts= JSON.parse(await fs.readFile(allProductsPathFile, 'utf-8'));

    
    const combinedPaths = [...allCategories, ...allProducts];

    const paths = combinedPaths.map((url: any) => {
        return { params: { slug: url } }  
    });
   let responseData = {
    paths,
    fallback: 'blocking' as const,
  }

  return responseData;

  } catch (error) {
    
  }
  try{
    console.log('/////////////////////getStaticPaths from server////////////')
    const response = await client.fetchCategories();
    const allUrl = response?.data?.categories?.items?.[0];
    const paths = allUrl.children.map((item: { url_path: string }) => {
            // Ensure the slug is an array of values
            return {
              params: {
                slug: item.url_path+'', // Split slug by '/' to get an array (e.g., ['product', 'green-t-shirt'])
              },
            };
          });

        
    let responseData = {
          paths,
          fallback: 'blocking' as const,
        }
   
    return responseData;
  } catch (error) {
    return {
      paths: [],
      fallback:'blocking' as const,
    };
  }
}

// Static Props
export const getStaticProps: GetStaticProps = async ({params, query}:any) => {
  

  // console.log("VERIFY--->"+process.env.NEXT_PHASE,"<-...process.env.NEXT_PHASE")

  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";
  
  const { slug } = params as { slug: string;};
  const urlPath=slug.replace(/\.html$/, '')
  console.log('/////////////////////getStaticProps////////////slug1:-',urlPath)
  const cacheStaticProps= createHash('md5')
  .update(urlPath+'')
  .digest('hex');

// During build: Try cache first (fast, low load)
    // During ISR/runtime: SKIP cache, always fetch fresh
    let useCache = isBuildTime; // Only use cache at build time

   
      // Your existing cache check loop
  // const cacheStaticPropsPath= path.resolve(`./cacheM/category/${cacheStaticProps}.json`)
  const cacheProductPropsPath= path.resolve(`./cacheM/product/${cacheStaticProps}.json`)
  if (useCache) {
    const cachePaths = [
     // path.resolve(`./cacheM/category/${cacheStaticProps}.json`),
      path.resolve(`./cacheM/product/${cacheStaticProps}.json`)
    ];

    for (const cachePath of cachePaths) {
      try {
        console.log('---------------------Return date from cache..')
        if(urlPath =='designers-live'){
          console.log('cachePath filename ',cachePath)
        }
        return JSON.parse(await fs.readFile(cachePath, 'utf-8'));
      } catch (error) {
       
      }
    }
  }
  
  const client = new Client();
  
  const page = query?.page ? parseInt(query.page as string, 10) : 1; // Get page from query or default to 1

  const fetchCategoryByURLKey = async (urlKey: string, page: number) => {
        try {
          const response = await client.fetchSubCategoryDataByUrlKey(urlKey, page);
          return response?.categoryList[0] || null;
      } catch (error) {
   
      }
    };

try {

  const collectionData = await client.fetchCollectionPage(urlPath as string);
  const collection = collectionData?.data?.categoryList?.[0] || null;
  console.log("RUNNNN 1")

  if(collection){

    console.log("RUNNNN 2")


  const category = await fetchCategoryByURLKey(urlPath as string, page) || null;

  const uid = category?.uid || null;

  // Fetch products for the category by UID and page
  let allProductList: any[] = []
  const fetchProductsByUID = async (uid: string, currentPage: number) => {
        try {
        const response = await client.fetchSubCategoryData(uid, currentPage);
        return response || null;
      } catch (error) {
        return null;
      }
 };

  let productsRes = uid ? await fetchProductsByUID(uid, page) : null;
   
  if (productsRes.products) {

    productsRes.products.items.forEach((item: any) => {
      allProductList.push(item)
    })
  }

  let responseData={
    props: {
      allProductList,      
      category,           
      currentPage: page,  
      productsRes,        
      collection,   
      generatedAt: new Date().toISOString(),
      view:'collection',
      urlPath:urlPath
    
    },
    revalidate: 10,
  }


  // await fs.writeFile(cacheStaticPropsPath, JSON.stringify(responseData));
  return responseData;
  }else{
    console.log(urlPath,"RUNNNN 3")
    const product = await client.fetchProductDetail(urlPath);

    console.log(product ,"RUNNNN 3")

    let productsResult = product?.data?.products || null
    const reviews = await client.fetchAllReviewValue() || null
     const ReturnDataCMSBlock = await client.fetchPDPReturnCMSBlock() || null; 
    let { filters, optionValueMap } =  createFiltersFromAggregations(productsResult.aggregations);
    let configuredProducts =  createProductsFromMagProducts(productsResult.items, filters, optionValueMap);
    const productData = configuredProducts[0] || null;
    const aggregations = productsResult?.aggregations || [];
 
    let responseData={
      props: {
        productData,
        aggregations,
        reviews,
        ReturnDataCMSBlock,  
        view:'product',
        generatedAt: new Date().toISOString(),
        urlPath:urlPath,
        check:useCache
      },
      revalidate: 10,
    }
    
    await fs.writeFile(cacheProductPropsPath, JSON.stringify(responseData));
    return responseData;
  }
} catch (error) {
  console.log(error,"error-error")
  return {
    props: {
      allProductList: [],  
      category: null,     
      currentPage: page,  
      productsRes: null,  
      collection: null,   
      generatedAt: new Date().toISOString(),
      view:'ERROR',
    },
    revalidate: 10,
  };
}
};

// Collection Component
const Collection = ({ check,view,urlPath,allProductList, category, productsRes, collection,categories,productData, aggregations, reviews, ReturnDataCMSBlock, categoriesList, showRibbon, isMobile,generatedAt}: any) => {

console.log(view,check,"viewviewview")

  const [price, setPrice] = useState<any>()
  const [productBbreadcrumbs, setProductBbreadcrumbs] = useState<any>([]);
  const router = useRouter()
  const url = router.query
  
  // ===========================BreadCrumbs Management=======================================

  const { slug, slug2, slug3, ...rest } = router.query;

  // Get all slugs from query
  const slugs = [slug, slug2, slug3, ...Object.values(rest)].filter(Boolean);

  const findCategoryName = (key: string, items?: any): string | null => {
    if (!Array.isArray(items)) return null; // Ensure items is an array

    for (const item of items) {
      if (item.url_key === key) {
        return item.name;
      }
      if (item.children) {
        const result = findCategoryName(key, item?.children);
        if (result) return result;
      }
    }
    return null;
  };
  
 // Create breadcrumb array dynamically by matching slugs to category names
 const breadcrumbs = [
  { name: 'Home', path: '' },
  ...slugs.map((slugPart: any, index) => ({
    name: findCategoryName(slugPart, categories?.data?.categories?.items) || slugPart.replace(/-/g, ' '),
    path: `/${slugs.slice(0, index + 1).join('/')}`,
  })),
];


const breadcrumbsProducts = [
  { name: 'Home', path: '' },
  { name: 'Watches', path: '/watches' },
  ...slugs.map((slugPart: any, index) => ({
    name: findCategoryName(slugPart, categories?.data?.categories?.items) || slugPart.replace(/-/g, ' '),
    path: `/${slugs.slice(0, index + 1).join('/')}`,
  })),
];


  useEffect(() => {

    // Retrieve breadcrumbs data from sessionStorage on the first render
    if (typeof window !== 'undefined') {
      const storedBreadcrumbs = sessionStorage.getItem('breadcrumbs');
      if (storedBreadcrumbs) {
        setProductBbreadcrumbs(JSON.parse(storedBreadcrumbs));
        // Clear breadcrumbs from sessionStorage
        sessionStorage.removeItem('breadcrumbs');
      }
    }
  }, []);

// ---------------------CategoriesProducts and Collection Meta Details------------------------------------

  const CategoryImage = collection?.image || '/default-image.jpg'
  const fileExtension = CategoryImage.split('.').pop()?.toLowerCase() || "jpg";

  const description = collection?.description || null
  const shortDescription = collection?.short_description || null
  const CollectionDescription = collection?.description || null


  // -------------------------------------Product Detail Meta Details-------------------------------------------
  function getMetaDescription(description: any) {
    let htmlData = description.html ? description.html : description
    htmlData = htmlData + ' '
    htmlData = htmlData.replaceAll(/(?:\r\n|\r|\n)/g, '<br>')
    htmlData = htmlData.replaceAll('<br><br>', '<br>')
    htmlData = htmlData.replaceAll('</p><br><p>', '</p><p>')
    htmlData = htmlData.replace(/<style[^>]*>.*<\/style>/g, '')
      // Remove script tags and content
      .replace(/<script[^>]*>.*<\/script>/g, '')
      // Remove all opening, closing and orphan HTML tags
      .replace(/<[^>]+>/g, '')
      // Remove leading spaces and repeated CR/LF
      .replace(/([\r\n]+ +)+/g, '');

    return htmlData.slice(0, 160)
  }


  const metaDiscription = productData 
  ? typeof productData.meta_description === "string" && productData.meta_description.trim() !== ""
    ? productData.meta_description
    : getMetaDescription(
        typeof productData.short_description === "string"
          ? productData.short_description
          : typeof productData.short_description?.html === "string"
            ? productData.short_description.html
            : typeof productData.description === "string"
              ? productData.description
              : typeof productData.description?.html === "string"
                ? productData.description.html
                : ""
      )
  : "";

  if(view=='collection'){

    return (
    <>
    
      <Head>
      <meta charSet="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

      <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${process.env.baseURLWithoutTrailingSlash}/${slug}`}/>

        <title>{collection?.meta_title || collection?.name}</title>
        <meta name="title" content={collection?.meta_title || collection?.name}/>
        {collection?.meta_description && (
          <meta name="description" content={collection?.meta_description}/>
        )}
        {collection?.meta_keywords && (
          <meta name="keywords" content={collection?.meta_keywords}/>
        )}
 


        <meta property="og:type" content="category"/>
        <meta property="og:title" content={collection?.meta_title || collection?.name}/>
        {collection?.meta_description && (
        <meta property="og:description" content={collection?.meta_description}/>
        )}
        <meta property="og:image" content={CategoryImage}/>
        <meta property="og:image:secure_url" content={CategoryImage}/>
        <meta property="og:image:width" content="800"/>
        <meta property="og:image:height" content="800"/>
        <meta property="og:image:type" content={`image/${fileExtension}`}/>
        <meta property="og:url" content={`${process.env.baseURLWithoutTrailingSlash}/${slug}`}/>
        <meta property="og:site_name" content="Headora"/>


        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content={collection?.meta_title || collection?.name}/>
        {collection?.meta_description && (
        <meta name="twitter:description" content={collection?.meta_description}/>
        )}
        <meta name="twitter:image" content={CategoryImage}/>
      </Head>

      
      <BreadcrumbSchema breadcrumbs={breadcrumbs} />
      <CategorySchema category={collection} url={slug}/>
      <CategoryProductSchema products={allProductList} />

      {category?.display_mode === "PAGE" ? (
        <>
          <CollectionHeader Data={collection} />
          <CollectionBreadCrumbs Data={collection} />
          <CollectionListing Collection={collection} />
          <CollectionReletatedProducts Data={category} Collection={collection} />
          {/* <CollectionContent BlogContent={BlogContent}/> */}
          <Content description={CollectionDescription}/>
        </>
      ) : (
        <>
        <div style={{position:'relative'
        }}>
          <CategoryHeader Data={{ name: category?.name, description:category?.short_description }} categories={categories}/>
          {/* <p>generatedAt: {generatedAt}</p> */}
          <p style={{color:"wheat"}}>generatedAt: {generatedAt}+process.env.NEXT_PHASE,"process.env.NEXT_PHASE"</p>
          <CategoriesProducts
            Data={{ name: category?.name }}
            categoryDetail={category}
            categoriesData={productsRes}
            productsData={allProductList}
            showRibbon={showRibbon}
            isMobile={isMobile}
          />
          
          <Content description={category?.description} />
          </div>
        </>
      )}
    </>
  );
}else if(view=='product'){
 const schemaImage = productData?.__typename === "ConfigurableProduct"
    ? productData?.variants?.[0]?.media_gallery?.[0]?.url?.replace(/\/cache\/.*?\//, "/")
    : productData?.image?.url?.replace(/\/cache\/.*?\//, "/") || `${process.env.baseURL}media/catalog/product/placeholder/default/coming-soon-sign_3.jpg`;
  const fileExtension = schemaImage?.split('.').pop()?.toLowerCase() || "jpg";

  return (
<>
<Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Robots */}
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${process.env.baseURLWithoutTrailingSlash}/${slug}`} />
        {/* Title and Canonical */}
        


        {/* SEO Meta Tags */}
         <title>{`${productData?.meta_title ? productData?.meta_title : productData?.name}`}</title>
        <meta name="title" content={`${productData?.meta_title ? productData?.meta_title : productData?.name}`} />
        <meta name="description"
          content={metaDiscription}
        />
        <meta name="keywords" content={productData?.meta_keyword ? productData?.meta_keyword : 'Headora'} />

        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${productData?.meta_title ? productData?.meta_title : productData?.name}`} />
        <meta property="og:description"
          content={
            metaDiscription
          }
        />
        <meta property="og:url" content={`${process.env.baseURL}/${productData?.url_key}.html`} />
        <meta property="og:site_name" content="Headora" />
        <meta property="og:image" content={schemaImage} />
        <meta property="og:image:secure_url" content={schemaImage} />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="800" />
        <meta property="og:image:type" content={`image/${fileExtension}`} />
        <meta property="og:price:amount" content={price} />
        <meta property="og:price:currency" content="USD" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${productData?.meta_title ? productData?.meta_title : productData?.name}`} />
        <meta name="twitter:description"
          content={metaDiscription}
        />
        <meta name="twitter:image" content={schemaImage} />

        {/* Schema.org Meta Tags */}
        <meta itemProp="name" content={productData?.name} />
        <meta itemProp="description"
          content={metaDiscription}
        />
        <meta itemProp="image" content={schemaImage} />
      </Head>

        {/* <BreadcrumbSchema breadcrumbs={breadcrumbs} products={productData} /> */}
        {/* <ProductSchema product={productData} aggregations={aggregations} schemaImage={schemaImage} price={price} metaDiscription={metaDiscription} /> */}
       
        <BreadcrumbSchema breadcrumbs={breadcrumbsProducts} products={productData} />
        <p>generatedAt: {generatedAt}+process.env.NEXT_PHASE,"process.env.NEXT_PHASE"</p>
        <ProductSchema product={productData} aggregations={aggregations} schemaImage={schemaImage} price={price} metaDiscription={metaDiscription} />
        
        <ProductDetail 
        Data={productData} 
        aggregations={aggregations} 
        categories={categories} 
        breadcrumbs={productBbreadcrumbs} 
        setPrice={setPrice} 
        ReturnDataCMSBlock={ReturnDataCMSBlock}
        showRibbon={showRibbon}/>
          {/* <StaticReview /> */}
        <p style={{color:"wheat"}}>generatedAt: {generatedAt}+{process.env.NEXT_PHASE},"process.env.NEXT_PHASE"</p>

        <ReviewSection Data={productData} AllReviews={reviews} />
        <CrossSellProducts Data={productData}/>
        <UpSellProducts Data={productData}/>
        <ReletedProducts Data={productData} />
        <RelatedBrands RelatedCategories={productData?.categories} categoriesList={categoriesList} />
        </>
  );
}else{
  const router = useRouter();

  // useEffect(() => {
  //   router.push('/404');
  // }, []);

  return null;
}
}

export default Collection;
