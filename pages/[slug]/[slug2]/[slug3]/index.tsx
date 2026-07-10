
import Filter from '@/components/Filters/Filter'
import CategoryHeader from '@/components/Category/CategoryHeader'
import { Client } from '@/graphql/client';
import CategoriesProducts from '@/components/Category/CategoriesProducts';
import { GetStaticPaths } from 'next';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import Head from 'next/head'
import Content from '@/components/Category/Content';
import { useRouter } from 'next/router';

import fs from 'fs/promises';
  import path from 'path';
  import { createHash } from 'crypto';





// ==================== SCHEMA COMPONENTS ====================

// 1. Collection / Category Schema
const CategorySchema = ({ category, url }: any) => {
  if (!category) return null;
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category?.meta_title || category?.name,
    "description": category?.meta_description || "",
    "image": category?.image || "https://timeluxury.com/Logo/Logo_transparent.png",
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
const ProductSchema = ({ products }: any) => {
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




export const getStaticPaths: GetStaticPaths = async () => {

  const allCategoriesPathFile = path.resolve(`./cacheM/thirdLevelCategoriesPath.json`);
    try {
      let allCategories= JSON.parse(await fs.readFile(allCategoriesPathFile, 'utf-8'));
      const paths = allCategories.map((url: any) => {
        let urlPath = url.split('/');
        return { 
          params: { 
              slug: urlPath[0] || '',
              slug2: urlPath[1] || '',
              slug3: urlPath[2] || ''
            } 
          }  // Single segment case
            

    });
     let responseData = {
      paths,
      fallback: false,
    }
  
    return responseData;
  
    } catch (error) {
      
    }
  const client = new Client();

  const fetchAllCategories = async () => {
    const response = await client.fetchSSGSubCategoryData();
    return response?.categories?.items[0];
  };

  const categories = await fetchAllCategories();
  let paths: { params: { slug: any; slug2: any; slug3?: any } }[] = [];
 if (categories?.children) {
    categories.children.forEach((category: any) => {
      if (category.children) {
        category.children.forEach((subCategory: any) => {
          if (subCategory?.children) {
            subCategory.children.forEach((subSubCategory: any) => {

              if (subSubCategory.url_path) {
                let urlPath =subSubCategory.url_path.split('/')
                paths.push({
                  params: { slug: urlPath[0], slug2: urlPath[1], slug3: urlPath[2]  }
                });
              }
            })
          }

        });
      }
    });
  }
  let responseData = {
    paths,
    fallback: false,
  }
  return responseData;
};



export const getStaticProps: GetStaticProps = async ({ params, query }: any) => {
  const { slug,slug2,slug3 } = params as { slug: string ,slug2: string,slug3: string;};
  const urlPath=slug+'/'+slug2+'/'+slug3?.replace(/\.html$/, '')


    const cacheStaticProps= createHash('md5')
      .update(urlPath)
      .digest('hex')





let cacheStaticPropsPath:any
const isBuildTime = process.env.BUILD_MODE === 'build';

// ====================== BUILD TIME ============================

 if (isBuildTime) {

      cacheStaticPropsPath= path.resolve(`./cacheM/category/${cacheStaticProps}.json`)
      try {
      let cachedProps = JSON.parse(await fs.readFile(cacheStaticPropsPath, 'utf-8'));
      return {
      ...cachedProps,
        revalidate: 10,
      };

      } catch (error) {
        
      }
    }

  const client = new Client();

  // Handle slug and page from params and query
  const page = query?.page ? parseInt(query.page as string, 10) : 1;



  // Fetch category data based on URL key
  const fetchCategoryByURLKey = async (urlKey: string, page: number) => {
    console.log('Generating collection '+urlKey)
    try {
    const response = await client.fetchSubCategoryDataByUrlKey(urlKey, page);
    return response?.categoryList[0] || null;
  } catch (error) {
    return null;
  }
  };
  try {
    const collectionData = await client.fetchCollectionPage(urlPath as string);
    const collection = collectionData?.data?.categoryList?.[0] || null;
    const category = await fetchCategoryByURLKey(urlPath as string, page);


  const uid = category.uid || null;

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

  let productsRes = await fetchProductsByUID(uid, page);
  if (productsRes.products) {
    productsRes.products.items.forEach((item: any) => {
      allProductList.push(item)
    })
   
  }

  let responseData={
        props: {
          allProductList,       // Products data
          category,            // Category data
          currentPage: page,   // Current page number
          productsRes,         // Product response data
          collection,
          collectionData
        },
        revalidate: 10,
      };
      if (isBuildTime) {await fs.writeFile(cacheStaticPropsPath, JSON.stringify(responseData));}
      return responseData;

  
} catch (error) {
  return {
    props: {
      allProductList: [],  // Empty products list
      category: null,     // Null category data
      currentPage: page,  // Current page number
      productsRes: null,  // Null product response
    },
    revalidate: 10,
  };
}
};


const Subcategory = ({ allProductList, category, productsRes,categories, showRibbon, isMobile }: any) => {

  const router = useRouter()
  const url = router.asPath

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
        const result = findCategoryName(key, item.children);
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
  return (
    <>
      <Head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
 
        <meta name="robots" content="index, follow"/>
        <link rel="canonical" href={`${process.env.baseURLWithoutTrailingSlash}${url}`}/>

        
        <title>{category?.meta_title ? category?.meta_title : category?.name}</title>
        <meta name="title" content={`${category?.meta_title || category?.name}`}/>
        {category?.meta_description && (
          <meta name="description" content={category?.meta_description}/>
        )}
        {category?.meta_keywords && (
          <meta name="keywords" content={category?.meta_keywords}/>
        )}
   
        <meta property="og:title" content={`${category?.meta_title || category?.name}`}/>
        {category?.meta_description && (
        <meta property="og:description" content={category?.meta_description}/>
        )}
        <meta property="og:url" content={`${process.env.baseURLWithoutTrailingSlash}${url}`}/>
        <meta property="og:type" content="category"/>


        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content={`${category?.meta_title || category?.name}`}/>
        {category?.meta_description && (
        <meta name="twitter:description" content={category?.meta_description}/>
        )}
      </Head>
      <BreadcrumbSchema breadcrumbs={breadcrumbs} />
      <CategorySchema category={category} url={`${slug}/${slug2}/${slug3}`} />
      <ProductSchema products={allProductList} />

          <CategoryHeader Data={{ name: category?.name, description:category?.short_description }} categories={categories}/>

      <CategoriesProducts
        Data={{ name: category?.name }}
        categoriesData={productsRes}
        productsData={allProductList}
        categoryDetail={category}
        showRibbon={showRibbon}
        isMobile={isMobile}
      />
      <Content description={category?.description} />
 
    </>
  );
};

export default Subcategory;