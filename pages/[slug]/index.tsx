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
import React, { useEffect, useState } from 'react'
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

interface CollectionProps {
  collection: {
    name: string;
    description?: string;
    [key: string]: any;
  };
}

// ==================== HELPERS ====================

const getBaseUrl = () =>
  (process.env.baseURLForSchema || process.env.baseURLWithoutTrailingSlash || '').replace(/\/$/, '');

function getMetaDescription(description: any): string {
  if (!description) return '';

  let htmlData =
    typeof description === 'object' && description.html
      ? description.html
      : String(description);

  return htmlData
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/([\r\n]+ +)+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

// ==================== SCHEMA COMPONENTS ====================

const CategorySchema = ({ category, url }: any) => {
  if (!category) return null;

  const base = getBaseUrl();
  const pageUrl = `${base}/${url}`.replace(/\/+$/, '') + '/';

  const image = category?.image
    ? category.image.startsWith('http')
      ? category.image
      : `${base}${category.image.startsWith('/') ? '' : '/'}${category.image}`
    : undefined;

  const description =
    category?.meta_description?.trim() ||
    getMetaDescription(category?.description) ||
    getMetaDescription(category?.short_description) ||
    '';

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category?.meta_title || category?.name || "",
    "description": description,
    ...(image && { image }),
    "url": pageUrl,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

const BreadcrumbSchema = ({ breadcrumbs }: any) => {
  if (!breadcrumbs?.length) return null;

  const base = getBaseUrl();

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb: any, index: number) => {
      const path = (breadcrumb?.path || '').replace(/^\/+/, '').replace(/\/+$/, '');
      const itemUrl = path ? `${base}/${path}/` : `${base}/`;

      return {
        "@type": "ListItem",
        "position": index + 1,
        "name": breadcrumb?.name || "",
        "item": itemUrl,
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
    />
  );
};

const CategoryProductSchema = ({ products }: any) => {
  if (!products?.length) return null;

  const base = getBaseUrl();

  const schemaList = products.map((product: any) => {
    const mainImage =
      product.image?.url ||
      product.media_gallery?.[0]?.url ||
      "";

    const price =
      product.price_range?.minimum_price?.regular_price?.value ??
      product.price?.regularPrice?.value ??
      0;

    const currency =
      product.price_range?.minimum_price?.regular_price?.currency ||
      product.price?.regularPrice?.currency ||
      "USD";

    const availability =
      product.stock_status === "IN_STOCK"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";

    const productUrl = `${base}/${product.url_key}/`;

    return {
      "@type": "Product",
      "name": product.name,
      "sku": product.sku,
      "image": mainImage,
      "description": product.short_description || product.description || "",
      "url": productUrl,
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "price": price,
        "priceCurrency": currency,
        "availability": availability,
      },
    };
  });

  const graph = {
    "@context": "https://schema.org",
    "@graph": schemaList,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
};

const ProductSchema = ({
  product,
  aggregations,
  schemaImage,
  price,
  metaDiscription,
}: any) => {
  if (!product) return null;

  const base = getBaseUrl();

  const getBrandName = () => {
    const brandAttr =
      aggregations?.find((a: any) => a.attribute_code === "br_1_brand") ||
      aggregations?.find((a: any) => a.attribute_code === "brand");
    return brandAttr?.options?.[0]?.label || "Headora";
  };

  const categories = product?.categories || [];
  const categoryPath = categories.map((c: any) => c?.name).filter(Boolean).join(" > ");

  const images =
    product?.media_gallery?.map((img: any) => img?.url).filter(Boolean) ||
    (product?.image?.url ? [product.image.url] : []);

  const finalImages = schemaImage
    ? [schemaImage, ...images.filter((i: string) => i !== schemaImage)]
    : images;

  const getAttr = (code: string) => {
    const attr = aggregations?.find((a: any) => a.attribute_code === code);
    return attr?.options?.map((opt: any) => opt?.label) || [];
  };

  const material =
    getAttr("br_1_case_material")[0] || getAttr("br_1_band_material")[0];
  const color = getAttr("br_1_dial_color")[0];
  const features = getAttr("br_1_features");

  const reviews = product?.reviews?.items || [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + (r?.average_rating || 0), 0) /
          reviews.length /
        20
      : null;

  const aggregateRating =
    averageRating !== null
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(averageRating.toFixed(1)),
          reviewCount: reviews.length,
          bestRating: 5,
          worstRating: 1,
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
            ratingValue: Number(((r?.average_rating || 0) / 20).toFixed(1)),
            bestRating: 5,
            worstRating: 1,
          },
          datePublished: r?.created_at || undefined,
          author: {
            "@type": "Person",
            name: r?.nickname || "Anonymous",
          },
        }))
      : undefined;

  const offerPrice =
    price ??
    product?.price?.regularPrice?.amount?.value ??
    product?.price_range?.minimum_price?.final_price?.value ??
    product?.price_range?.minimum_price?.regular_price?.value;

  const offerCurrency =
    product?.price?.regularPrice?.amount?.currency ||
    product?.price_range?.minimum_price?.final_price?.currency ||
    "USD";

  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  const productUrl = `${base}/${product?.url_key}/`;

  const offer = {
    "@type": "Offer",
    url: productUrl,
    priceCurrency: offerCurrency,
    price: offerPrice,
    availability:
      product?.stock_status === "OUT_OF_STOCK"
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    priceValidUntil: oneYearLater.toISOString().split('T')[0],
    seller: {
      "@type": "Organization",
      name: "Headora",
    },
  };

  const schemaData: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product?.meta_title || product?.name,
    sku: product?.sku,
    mpn: product?.sku,
    description: metaDiscription || product?.meta_description || product?.short_description || "",
    url: productUrl,
    image: finalImages.length ? finalImages : undefined,
    brand: {
      "@type": "Brand",
      name: getBrandName(),
    },
    category: categoryPath || undefined,
    ...(material && { material }),
    ...(color && { color }),
    ...(features?.length > 0 && {
      additionalProperty: features.map((f: string) => ({
        "@type": "PropertyValue",
        name: "Feature",
        value: f,
      })),
    }),
    offers: offer,
    ...(aggregateRating && { aggregateRating }),
    ...(reviewSchema && { review: reviewSchema }),
  };

  Object.keys(schemaData).forEach((key) => {
    if (schemaData[key] === undefined) delete schemaData[key];
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

// ========================================== Static Paths =======================================

export const getStaticPaths: GetStaticPaths = async () => {
  const client = new Client();
  const allCategoriesPathFile = path.resolve(`./cacheM/topLevelCategoriesPath.json`);
  const allProductsPathFile = path.resolve(`./cacheM/allProductsPath.json`);

  try {
    let allCategories = JSON.parse(await fs.readFile(allCategoriesPathFile, 'utf-8')).map(
      (item: any) => item.replace(/\.html$/, '')
    );

    // let allProducts = JSON.parse(await fs.readFile(allProductsPathFile, 'utf-8')).map(
    //   (item: any) => item.replace(/\.html$/, '')
    // );
     
     let allProducts = JSON.parse(await fs.readFile(allProductsPathFile, 'utf-8'));

    

    const combinedPaths = [...allCategories, ...allProducts];

    const paths = combinedPaths.map((url: any) => ({
      params: { slug: url },
    }));

    return {
      paths,
      fallback: false,
    };
  } catch (error) {
    // fallback
  }

  try {
    const response = await client.fetchCategories();
    const allUrl = response?.data?.categories?.items?.[0];
    const paths = allUrl.children.map((item: { url_path: string }) => ({
      params: {
        slug: item.url_path,
      },
    }));

    return {
      paths,
      fallback: false,
    };
  } catch (error) {
    return {
      paths: [],
      fallback: false,
    };
  }
};

// Static Props
export const getStaticProps: GetStaticProps = async ({ params, query }: any) => {
  const { slug } = params as { slug: string };
  
  const urlPath = slug.replace(/\.html$/, '');
  
  
  const cacheStaticProps = createHash('md5')
                .update(urlPath + '.html')
                .digest('hex');


  const cacheStaticPropsPath = path.resolve(
    `./cacheM/category/${cacheStaticProps}.json`
  );

  const cacheProductPropsPath = path.resolve(
    `./cacheM/product/${cacheStaticProps}.json`
  );

  const cachePaths = [
    cacheStaticPropsPath,
    cacheProductPropsPath,
  ];

  const isBuildTime = process.env.BUILD_MODE === 'build';
  console.log(`Generating Page for URL Path:-  ${urlPath}`);
 
  // =====================================================
  // 1. BUILD-TIME CACHE
  // Read custom JSON cache only during next build.
  // At ISR/runtime, bypass these files and fetch fresh data.
  // =====================================================

  if (isBuildTime) {
    for (const cachePath of cachePaths) {
      try {
        const cachedContent = await fs.readFile(
          cachePath,
          "utf-8"
        );

        const cachedProps = JSON.parse(cachedContent);

        return {
          ...cachedProps,
          revalidate: 10,
        };
      } catch (error: any) {
        
      }
    }
  }
  
  // =====================================================
  // 2. ISR / RUNTIME: FETCH FRESH DATA
  // This section executes when no build cache is used.
  // =====================================================

  //console.log(`[ISR] Fetching fresh data for: ${urlPath}`);

  const client = new Client();

  const page = query?.page
    ? parseInt(String(query.page), 10)
    : 1;

  const fetchCategoryByURLKey = async (
    urlKey: string,
    currentPage: number
  ) => {
    try {
      const response =
        await client.fetchSubCategoryDataByUrlKey(
          urlKey,
          currentPage
        );

      return response?.categoryList?.[0] || null;
    } catch (error: any) {
      console.error(
        `[CATEGORY ERROR] ${urlKey}: ${error.message}`
      );

      return null;
    }
  };

  const fetchProductsByUID = async (
    uid: string,
    currentPage: number
  ) => {
    try {
      return await client.fetchSubCategoryData(
        uid,
        currentPage
      );
    } catch (error: any) {
      console.error(
        `[PRODUCT LIST ERROR] ${uid}: ${error.message}`
      );

      return null;
    }
  };

  // Write the custom cache only during the build.
  const saveBuildCache = async (
    cachePath: string,
    responseData: any
  ) => {
     if (!isBuildTime) {
       return;
    }

    try {
      
      await fs.mkdir(path.dirname(cachePath), {
        recursive: true,
      });

      await fs.writeFile(
        cachePath,
        JSON.stringify(responseData),
        "utf-8"
      );

      console.log(`[CACHE SAVED] ${cachePath}`);
    } catch (error: any) {
      console.error(
        `[CACHE WRITE ERROR] ${cachePath}: ${error.message}`
      );
    }
  };

  try {
  // ===================================================
  // 3. CHECK WHETHER THIS URL IS A COLLECTION
  // ===================================================

  const collectionData =
    await client.fetchCollectionPage(
      urlPath as string
    );

  const collection =
    collectionData?.data?.categoryList?.[0] || null;

  if (collection) {
    console.log(`[ISR] Generating collection: ${urlPath}`);

    const category =
      (await fetchCategoryByURLKey(
        urlPath as string,
        page
      )) || null;

    const uid = category?.uid || null;

    let productsRes = uid
      ? await fetchProductsByUID(uid, page)
      : null;

    const allProductList: any[] =
      productsRes?.products?.items || [];

    const responseData = {
      props: {
        allProductList,
        category,
        currentPage: page,
        productsRes,
        collection,
        generatedAt: new Date().toISOString(),
        view: "collection",
        urlPath,
      },
      revalidate: 10,
    };

    await saveBuildCache(
      cacheStaticPropsPath,
      responseData
    );

    return responseData;
  }

  // ===================================================
  // 4. NOT A COLLECTION: FETCH PRODUCT DETAILS
  // ===================================================

  console.log(`[ISR] Generating product: ${urlPath}`);

  const product = await client.fetchProductDetail(
    urlPath as string
  );

  const productsResult =
    product?.data?.products || null;

  if (!productsResult?.items?.length) {
    throw new Error(
      `No product data returned by Magento for ${urlPath}`
    );
  }

  // Fetch supplementary data.
  const [reviews, ReturnDataCMSBlock] =
    await Promise.all([
      client.fetchAllReviewValue().catch((error: any) => {
        console.error(
          `[REVIEWS ERROR] ${error.message}`
        );
        return null;
      }),

      client.fetchPDPReturnCMSBlock().catch((error: any) => {
        console.error(
          `[CMS BLOCK ERROR] ${error.message}`
        );
        return null;
      }),
    ]);

  const aggregations =
    productsResult.aggregations || [];

  const {
    filters,
    optionValueMap,
  } = createFiltersFromAggregations(aggregations);

  const configuredProducts =
    createProductsFromMagProducts(
      productsResult.items,
      filters,
      optionValueMap
    );

  const productData =
    configuredProducts[0] || null;

  const responseData = {
    props: {
      productData,
      aggregations,
      reviews,
      ReturnDataCMSBlock,
      view: "product",
      urlPath,
      generatedAt: new Date().toISOString(),
    },
    revalidate: 10,
  };

  await saveBuildCache(
    cacheProductPropsPath,
    responseData
  );

  return responseData;

} catch (error: any) {
  console.error(
    `[PAGE GENERATION ERROR] ${urlPath}:`,
    error
  );

  // Avoid silently treating an API failure as a valid page.
  // Throwing lets Next.js handle a failed regeneration rather
  // than replacing the existing generated page with empty props.
  throw error;
}
};

// ==================== PAGE COMPONENT ====================

const Collection = ({
  view,
  urlPath,
  allProductList,
  category,
  productsRes,
  collection,
  categories,
  productData,
  aggregations,
  reviews,
  ReturnDataCMSBlock,
  categoriesList,
  showRibbon,
  isMobile,
  generatedAt,
}: any) => {
  const [price, setPrice] = useState<any>();
  const [productBbreadcrumbs, setProductBbreadcrumbs] = useState<any>([]);
  const router = useRouter();

  const { slug, slug2, slug3, ...rest } = router.query;
  const slugs = [slug, slug2, slug3, ...Object.values(rest)].filter(Boolean);

  const findCategoryName = (key: string, items?: any): string | null => {
    if (!Array.isArray(items)) return null;

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

  const breadcrumbs = [
    { name: 'Home', path: '' },
    ...slugs.map((slugPart: any, index) => ({
      name:
        findCategoryName(slugPart, categories?.data?.categories?.items) ||
        String(slugPart).replace(/-/g, ' '),
      path: `/${slugs.slice(0, index + 1).join('/')}`,
    })),
  ];

  // Product breadcrumbs – use sessionStorage if available, otherwise dynamic
  const productBreadcrumbs =
    productBbreadcrumbs?.length > 0 ? productBbreadcrumbs : breadcrumbs;

  useEffect(() => {
    console.log('=== CURRENT VIEW ===', view, 'urlPath', urlPath, 'URL:', router.asPath);
  }, [view, router.asPath]);

  useEffect(() => {
    setPrice(null);
    setProductBbreadcrumbs([]);

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('breadcrumbs');
    }
  }, [router.asPath]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBreadcrumbs = sessionStorage.getItem('breadcrumbs');
      if (storedBreadcrumbs) {
        setProductBbreadcrumbs(JSON.parse(storedBreadcrumbs));
        sessionStorage.removeItem('breadcrumbs');
      }
    }
  }, [router.asPath]);

  // --------------------- Collection Meta ---------------------
  const rawCategoryImage = collection?.image || '/Logo/Logo.png' || '/default-image.jpg';
  const CategoryImage = rawCategoryImage.startsWith('http')
    ? rawCategoryImage
    : `${process.env.baseURLWithoutTrailingSlash}${rawCategoryImage.startsWith('/') ? '' : '/'}${rawCategoryImage}`;

  const fileExtension =
    CategoryImage.split('.').pop()?.toLowerCase()?.split('?')[0] || 'jpg';

  const CollectionDescription = collection?.description || null;

  const collectionTitle = collection?.meta_title || collection?.name || '';
  const collectionDescription =
    collection?.meta_description?.trim() ||
    getMetaDescription(collection?.description) ||
    getMetaDescription(collection?.short_description) ||
    '';

  // --------------------- Product Meta ---------------------
  const descriptionSource =
    productData?.short_description?.html?.trim()
      ? productData.short_description.html
      : typeof productData?.short_description === 'string' && productData.short_description.trim()
      ? productData.short_description
      : productData?.description?.html?.trim()
      ? productData.description.html
      : typeof productData?.description === 'string' && productData.description.trim()
      ? productData.description
      : '';

  const metaDiscription =
    typeof productData?.meta_description === 'string' && productData.meta_description.trim()
      ? productData.meta_description
      : getMetaDescription(descriptionSource);

  const isCollection = view === 'collection';
  const isProduct = view === 'product';

  if (!isCollection && !isProduct) {
    return null;
  }

  // Product image – always absolute
  const rawSchemaImage = isProduct
    ? (productData?.__typename === 'ConfigurableProduct'
        ? productData?.image?.url?.replace(/\/cache\/.*?\//, '/')
        : productData?.variants?.[0]?.media_gallery?.[0]?.url?.replace(/\/cache\/.*?\//, '/')) ||
      `${process.env.baseURL}media/catalog/product/placeholder/default/coming-soon-sign_3.jpg`
    : null;

  const absoluteSchemaImage = rawSchemaImage
    ? rawSchemaImage.startsWith('http')
      ? rawSchemaImage
      : `${process.env.baseURLWithoutTrailingSlash}${rawSchemaImage.startsWith('/') ? '' : '/'}${rawSchemaImage}`
    : null;

  const productFileExtension =
    absoluteSchemaImage?.split('.').pop()?.toLowerCase()?.split('?')[0] || 'jpg';

  const productTitle = productData?.meta_title || productData?.name || '';
  const productCanonical = `${process.env.baseURLWithoutTrailingSlash}/${productData?.url_key || slug}`;
  const collectionCanonical = `${process.env.baseURLWithoutTrailingSlash}/${slug}`;
  

  return (
    <div key={urlPath || router.asPath}>
      {/* ===================== COLLECTION ===================== */}
      {isCollection && (
        <>
          <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            <meta name="robots" content="noindex, nofollow" />
            <link rel="canonical" href={collectionCanonical} />

            <title>{collectionTitle}</title>
            <meta name="title" content={collectionTitle} />
            {collectionDescription && (
              <meta name="description" content={collectionDescription} />
            )}
            {collection?.meta_keywords && (
              <meta name="keywords" content={collection.meta_keywords} />
            )}

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={collectionTitle} />
            {collectionDescription && (
              <meta property="og:description" content={collectionDescription} />
            )}
            <meta property="og:url" content={collectionCanonical} />
            <meta property="og:site_name" content="Headora" />
            <meta property="og:image" content={CategoryImage} />
            <meta property="og:image:secure_url" content={CategoryImage} />
            <meta property="og:image:width" content="800" />
            <meta property="og:image:height" content="800" />
            <meta property="og:image:type" content={`image/${fileExtension}`} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={collectionTitle} />
            {collectionDescription && (
              <meta name="twitter:description" content={collectionDescription} />
            )}
            <meta name="twitter:image" content={CategoryImage} />
          </Head>

          <BreadcrumbSchema breadcrumbs={breadcrumbs} />
          <CategorySchema category={collection} url={slug} />
          <CategoryProductSchema products={allProductList} />

          {category?.display_mode === 'PAGE' ? (
            <>
              <CollectionHeader Data={collection} />
              <CollectionBreadCrumbs Data={collection} />
              <CollectionListing Collection={collection} />
              <CollectionReletatedProducts Data={category} Collection={collection} />
              <Content description={CollectionDescription} />
            </>
          ) : (
            <div style={{ position: 'relative' }}>
              <CollectionBreadCrumbs Data={collection} />
              <CollectionHeader Data={collection} />
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
          )}
        </>
      )}

      {/* ===================== PRODUCT ===================== */}
      {isProduct && (
        <>
          <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            <meta name="robots" content="noindex, nofollow" />
            <link rel="canonical" href={productCanonical} />

            <title>{productTitle}</title>
            <meta name="title" content={productTitle} />
            <meta name="description" content={metaDiscription} />
            <meta
              name="keywords"
              content={productData?.meta_keyword || 'Headora'}
            />

            {/* Open Graph */}
            <meta property="og:locale" content="en_US" />
            <meta property="og:type" content="product" />
            <meta property="og:title" content={productTitle} />
            <meta property="og:description" content={metaDiscription} />
            <meta property="og:url" content={productCanonical} />
            <meta property="og:site_name" content="Headora" />
            <meta property="og:image" content={absoluteSchemaImage || ''} />
            <meta property="og:image:secure_url" content={absoluteSchemaImage || ''} />
            <meta property="og:image:width" content="800" />
            <meta property="og:image:height" content="800" />
            <meta property="og:image:type" content={`image/${productFileExtension}`} />

            {price != null && (
              <>
                <meta property="og:price:amount" content={String(price)} />
                <meta property="og:price:currency" content="USD" />
              </>
            )}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={productTitle} />
            <meta name="twitter:description" content={metaDiscription} />
            <meta name="twitter:image" content={absoluteSchemaImage || ''} />

            {/* Microdata fallbacks */}
            <meta itemProp="name" content={productData?.name} />
            <meta itemProp="description" content={metaDiscription} />
            <meta itemProp="image" content={absoluteSchemaImage || ''} />
          </Head>
           
          <BreadcrumbSchema breadcrumbs={productBreadcrumbs} />

          <ProductSchema
            product={productData}
            aggregations={aggregations}
            schemaImage={absoluteSchemaImage}
            price={price}
            metaDiscription={metaDiscription}
          />

          <ProductDetail
            productData={productData}
            aggregations={aggregations}
            breadcrumbs={productBbreadcrumbs}
            setPrice={setPrice}
            ReturnDataCMSBlock={ReturnDataCMSBlock}
            showRibbon={showRibbon}
            AllReviews={reviews}
          />

          <CrossSellProducts 
            productData={productData} 
          />

          <UpSellProducts 
            productData={productData} 
          />

          <ReletedProducts 
            productData={productData} 
          />

          {/* 
          <RelatedBrands
            RelatedCategories={productData?.categories}
            categoriesList={categoriesList}
          />
           */}

          

          
          
        </>
      )}
    </div>
  );
};

export default Collection;