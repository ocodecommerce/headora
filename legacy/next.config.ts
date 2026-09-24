import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  reactStrictMode: true,
  

  env: {
    magentoEndpoint: 'https://headora.ocodecommerce.com/graphql', // magento endpoint
    baseURL:'https://headora.ocodecommerce.com/', // baseURL of your site with  trailing slash 
    baseURLWithoutTrailingSlash:'https://headora.ocodecommerce.com', // baseURL of your site without trailing slash 
    // SecondStoreURL: 'https://boutique.Headoranft.com/',
    baseURLForSchema:'https://headora.ocodecommerce.com',
    logoURL: '', // if you don't have Logo then leave it blank. 
    logoText: 'Headora', // if you don't have Logo then you can simply site name 
    siteName: 'Headora' // your site name
  },  

  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase request payload limit
    },
  },
  staticPageGenerationTimeout: 300000,
  // output: 'export',
  trailingSlash: false, // Ensures static files have .html
  
  images: {
    unoptimized: true,
  }

};

export default nextConfig;