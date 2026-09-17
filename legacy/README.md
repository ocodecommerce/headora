# Headora theme
Headora - Headless Magento Theme | Engineered an open-source headless e-commerce solution - Integrated Magento's GraphQL API with Next.js frontend - Implemented Static Site Generation (SSG) for optimal performance. Headora Theme is the Open Source Theme Available in Github it is accessible for everyone.
## About the Project

## Headora theme Overview

The [Headora theme](https://wiki.ocodecommerce.com/en/Theme/overview) is a headless eCommerce solution that integrates Magento's GraphQL API with a Next.js frontend. This setup allows for fast, scalable, and SEO-friendly eCommerce stores with enhanced flexibility in UI/UX customization.

![Logo](https://media.discordapp.net/attachments/1363776780502171650/1425016910881362010/image.png?ex=68e60deb&is=68e4bc6b&hm=0da001f533e45cdf5b7253cbdd11db4800a04a94b1e824f0e38e4206027e80e0&=&format=webp&quality=lossless&width=1376&height=730)

### **Headora theme Pages**  

- [**Home Page**](https://wiki.ocodecommerce.com/en/Theme/home-page) 
  - Displays featured products, categories, and promotional banners.  
  - Optimized for performance with fast-loading content.  
  - Engaging UI with dynamic product recommendations.  

- [**Category Page**](https://wiki.ocodecommerce.com/en/Theme/category-page)  
  - Lists all products within a specific category.  
  - Includes filtering and sorting options for better navigation.  
  - Supports pagination and quick product previews.  

- [**Sub-Category Page**](https://wiki.ocodecommerce.com/en/Theme/sub-category)  
  - Showcases products within a more refined category structure.  
  - Helps users navigate deeper into specific product groups.  
  - Maintains a clean and responsive layout for seamless browsing.  

Would you like me to refine or expand on any section? 🚀
## Key Features

* **Dynamic Routing:** Supports multi-level categories and product pages
* **SEO Optimization:** Built-in support for meta tags, OpenGraph, and structured data (JSON-LD)
* **Filtering and Sorting:** Advanced product filtering and sorting capabilities
* **Responsive Design:** Optimized for mobile, tablet, and desktop devices
* **Magento Integration:** Seamlessly integrates with Magento 2 via GraphQL API

## Getting Started

### Prerequisites

* Node.js (v18 or higher)
* Yarn (recommended for monorepo support)
* Magento 2 instance with GraphQL API enabled

# Installation and Setup Guide

## [Installation](https://wiki.ocodecommerce.com/en/Theme/installation)

### Step 1: Clone the Repository

To get started, clone the Next.js GitHub repository using one of the following methods:

#### HTTPS
```bash
git clone https://github.com/ocodecommerce/headora.git
```

#### SSH
```bash
git clone git@github.com:ocodecommerce/headora.git
```

#### GitHub CLI
```bash
gh repo clone ocodecommerce/headora
```

Choose the method that best suits your workflow.

---

### Step 2: Update `next.config.ts`

After cloning the repository, update the `next.config.ts` file to configure environment variables and image domains. Replace the placeholders with your actual Magento endpoint, base URL, and logo URL.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    magentoEndpoint: 'https://<your-domains>/graphql',
    baseURL: 'https://<your-domains>/',
    baseURLWithoutTrailingSlash: 'https://<your-domains>',
    siteLogoURL: '/Logo/EcommerceLogo.png'
  },
  staticPageGenerationTimeout: 300000,
  trailingSlash: true,
  images: {
    domains: ['<your-domains>'], // Add your domain here
  },
};

export default nextConfig;
```

---

### Step 3: Install Dependencies

Run the following commands to install the necessary packages and start the development server:

```bash
npm install
npm run dev
```

This will install all dependencies and start the project on your local development server.
## Project Structure

```
next-venia/
├── components/          # Reusable UI components
├── graphql/            # GraphQL queries and client setup
├── pages/              # Next.js pages and API routes
├── public/             # Static assets (images, fonts, etc.)
├── styles/             # Global and module-specific styles
├── utils/              # Utility functions and helpers
├── .env                # Environment variables
├── next.config.js      # Next.js configuration
├── package.json        # Project dependencies and scripts
└── README.md           # Project documentation
```
TEST
## License

This project is licensed under the MIT License.
