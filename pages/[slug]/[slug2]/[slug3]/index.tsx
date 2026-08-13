import Filter from '@/components/Filters/Filter'
import CategoryHeader from '@/components/Category/CategoryHeader'
import { Client } from '@/graphql/client';
import CategoriesProducts from '@/components/Category/CategoriesProducts';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import Head from 'next/head'
import Content from '@/components/Category/Content';
import { useRouter } from 'next/router';

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';


// ==================== HELPERS ====================

const getBaseUrl = () =>
  (process.env.baseURLForSchema || process.env.baseURLWithoutTrailingSlash || '').replace(/\/$/, '');

/** Clean HTML description for meta tags (max 160 chars) */
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

// 1. Collection / Category Schema
const CategorySchema = ({ category, url }: any) => {
  if (!category) return null;

  const base = getBaseUrl();
  const pageUrl = `${base}/${url}`.replace(/\/+$/, '') + '/';

  const image = category?.image
    ? category.image.startsWith('http')
      ? category.image
      : `${base}${category.image.startsWith('/') ? '' : '/'}${category.image}`
    : `${base}/Logo/Logo.png`; // fallback

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
    "image": image,
    "url": pageUrl,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

// 2. BreadcrumbList Schema
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

// 3. Product Schema (use @graph)
const ProductSchema = ({ products }: any) => {
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


// ==================== STATIC PATHS ====================

export const getStaticPaths: GetStaticPaths = async () => {
  const allCategoriesPathFile = path.resolve(`./cacheM/thirdLevelCategoriesPath.json`);

  try {
    let allCategories = JSON.parse(await fs.readFile(allCategoriesPathFile, 'utf-8'));
    const paths = allCategories.map((url: any) => {
      let urlPath = url.split('/');
      return {
        params: {
          slug: urlPath[0] || '',
          slug2: urlPath[1] || '',
          slug3: urlPath[2] || '',
        },
      };
    });

    return {
      paths,
      fallback: false,
    };
  } catch (error) {
    // fallback to live fetch
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
                let urlPath = subSubCategory.url_path.split('/');
                paths.push({
                  params: {
                    slug: urlPath[0],
                    slug2: urlPath[1],
                    slug3: urlPath[2],
                  },
                });
              }
            });
          }
        });
      }
    });
  }

  return {
    paths,
    fallback: false,
  };
};


// ==================== STATIC PROPS ====================

export const getStaticProps: GetStaticProps = async ({ params, query }: any) => {
  const { slug, slug2, slug3 } = params as {
    slug: string;
    slug2: string;
    slug3: string;
  };
  const urlPath = slug + '/' + slug2 + '/' + slug3?.replace(/\.html$/, '');

  const cacheStaticProps = createHash('md5').update(urlPath).digest('hex');

  let cacheStaticPropsPath: any;
  const isBuildTime = process.env.BUILD_MODE === 'build';

  // ====================== BUILD TIME ============================
  if (isBuildTime) {
    cacheStaticPropsPath = path.resolve(`./cacheM/category/${cacheStaticProps}.json`);
    try {
      let cachedProps = JSON.parse(await fs.readFile(cacheStaticPropsPath, 'utf-8'));
      return {
        ...cachedProps,
        revalidate: 10,
      };
    } catch (error) {
      // continue
    }
  }

  const client = new Client();
  const page = query?.page ? parseInt(query.page as string, 10) : 1;

  const fetchCategoryByURLKey = async (urlKey: string, page: number) => {
    console.log('Generating collection ' + urlKey);
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

    const uid = category?.uid || null;

    let allProductList: any[] = [];

    const fetchProductsByUID = async (uid: string, currentPage: number) => {
      try {
        const response = await client.fetchSubCategoryData(uid, currentPage);
        return response || null;
      } catch (error) {
        return null;
      }
    };

    let productsRes = uid ? await fetchProductsByUID(uid, page) : null;

    if (productsRes?.products) {
      productsRes.products.items.forEach((item: any) => {
        allProductList.push(item);
      });
    }

    let responseData = {
      props: {
        allProductList,
        category,
        currentPage: page,
        productsRes,
        collection,
        collectionData,
      },
      revalidate: 10,
    };

    if (isBuildTime) {
      await fs.writeFile(cacheStaticPropsPath, JSON.stringify(responseData));
    }

    return responseData;
  } catch (error) {
    return {
      props: {
        allProductList: [],
        category: null,
        currentPage: page,
        productsRes: null,
      },
      revalidate: 10,
    };
  }
};


// ==================== PAGE COMPONENT ====================

const Subcategory = ({
  allProductList,
  category,
  productsRes,
  categories,
  showRibbon,
  isMobile,
}: any) => {
  const router = useRouter();
  const url = router.asPath.split('?')[0]; // clean path (no query)

  const { slug, slug2, slug3, ...rest } = router.query;
  const slugs = [slug, slug2, slug3, ...Object.values(rest)].filter(Boolean);

  const findCategoryName = (key: string, items?: any): string | null => {
    if (!Array.isArray(items)) return null;

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

  const breadcrumbs = [
    { name: 'Home', path: '' },
    ...slugs.map((slugPart: any, index) => ({
      name:
        findCategoryName(slugPart, categories?.data?.categories?.items) ||
        String(slugPart).replace(/-/g, ' '),
      path: `/${slugs.slice(0, index + 1).join('/')}`,
    })),
  ];

  // ===== Meta description fallback =====
  const pageTitle = category?.meta_title || category?.name || '';
  const pageDescription =
    category?.meta_description?.trim() ||
    getMetaDescription(category?.description) ||
    getMetaDescription(category?.short_description) ||
    '';

  const canonicalUrl = `${process.env.baseURLWithoutTrailingSlash}${url}`;

  // Image for OG (absolute)
  const rawImage = category?.image || '/Logo/Logo.png';
  const CategoryImage = rawImage.startsWith('http')
    ? rawImage
    : `${process.env.baseURLWithoutTrailingSlash}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

  const fileExtension =
    CategoryImage.split('.').pop()?.toLowerCase()?.split('?')[0] || 'png';

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={canonicalUrl} />

        <title>{pageTitle}</title>
        <meta name="title" content={pageTitle} />
        {pageDescription && (
          <meta name="description" content={pageDescription} />
        )}
        {category?.meta_keywords && (
          <meta name="keywords" content={category.meta_keywords} />
        )}

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        {pageDescription && (
          <meta property="og:description" content={pageDescription} />
        )}
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Headora" />
        <meta property="og:image" content={CategoryImage} />
        <meta property="og:image:secure_url" content={CategoryImage} />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="800" />
        <meta property="og:image:type" content={`image/${fileExtension}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        {pageDescription && (
          <meta name="twitter:description" content={pageDescription} />
        )}
        <meta name="twitter:image" content={CategoryImage} />
      </Head>

      <BreadcrumbSchema breadcrumbs={breadcrumbs} />
      <CategorySchema category={category} url={`${slug}/${slug2}/${slug3}`} />
      <ProductSchema products={allProductList} />

      <CategoryHeader
        Data={{
          name: category?.name,
          description: category?.short_description,
        }}
        categories={categories}
      />

      <CategoriesProducts
        Data={{ name: category?.name }}
        categoriesData={productsRes}
        productsData={allProductList}
        categoryDetail={category}
        showRibbon={showRibbon}
        isMobile={isMobile}
      />

      {/* Full HTML description still shown on page */}
      <Content description={category?.description} />
    </>
  );
};

export default Subcategory;