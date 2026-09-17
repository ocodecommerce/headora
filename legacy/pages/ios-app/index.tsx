
import { Client } from "@/graphql/client";
import Head from "next/head";


function IOSAppPage({ CMSPageData }: any) {
    const sanitizedHtml = CMSPageData?.data?.cmsPage?.content;

    return (

        <>
        <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{CMSPageData?.title ? CMSPageData?.title : "ISO App | Headora"}</title>
        <meta
          name="description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "Shop Luxury Anywhere Comprehensive Marketplace In Your Pocket"}
        />
        <meta name="keywords" content={CMSPageData?.meta_keywords ? CMSPageData?.meta_keywords : "ISO App | Headora"}></meta>
        <meta
          name="robots"
       content="noindex, nofollow"
        />
        <link
          rel="canonical"
          href={`${process.env.baseURL}ios-app/`}
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={CMSPageData?.title ? CMSPageData?.title : "ISO App | Headora"} />
        <meta
          property="og:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "Shop Luxury Anywhere Comprehensive Marketplace In Your Pocket"}
        />
        <meta
          property="og:url"
          content={`${process.env.baseURL}ios-app/`}
        />
        <meta property="og:site_name" content="Headora" />
        <meta
          property="og:image"
          content={`${process.env.baseURL}/Images/iosogImage.jpg`}
        />
        <meta
          property="og:image:secure_url"
          content={`${process.env.baseURL}/Images/iosogImage.jpg`}
        />
        <meta property="og:image:width" content="6016" />
        <meta property="og:image:height" content="3916" />
        <meta
          property="og:image:alt"
          content={CMSPageData?.title ? CMSPageData?.title : "ISO App | Headora"}
        />
        <meta property="og:image:type" content="image/jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={CMSPageData?.title ? CMSPageData?.title : "ISO App | Headora"} />
        <meta
          name="twitter:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "Shop Luxury Anywhere Comprehensive Marketplace In Your Pocket"}
        />
        <meta
          name="twitter:image"
          content={`${process.env.baseURL}/Images/iosogImage.jpg`}
        />
        <meta name="twitter:label1" content="Time to read" />
        <meta name="twitter:data1" content="1 minute" />
      </Head>
     <div className="FreeSpaceForIOSApp"></div>
            <div
                dangerouslySetInnerHTML={{
                    __html: sanitizedHtml,
                }}
            />
        </>
    )
}
export default IOSAppPage


export async function getStaticProps() {
    const client = new Client();
    let CMSPageData = null;

    try {
        CMSPageData = await client.fetchIosAppPage();
    } catch (error) {

    }

    return {
        props: {
            CMSPageData,
        },
    };
}
