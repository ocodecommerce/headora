import { Client } from "@/graphql/client";
import Head from "next/head";


function OurStory({CMSPageData}:any){
    const sanitizedHtml = CMSPageData?.data?.cmsPage?.content;
    return(
        <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{CMSPageData?.title ? CMSPageData?.title : "Our Story | Headora "}</title>
        <meta
          name="description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "In the world of retail, it’s hard to know what’s real and if you’re getting a transparent experience. By providing access to an authentic experience where we’re always here to help you shop jewelry and watches, with every piece coming with a digital Authenticity Promise Report, we’re making truth accessible – and revolutionizing modern luxury.. "}
        />
        <meta name="keywords" content={CMSPageData?.meta_keywords ? CMSPageData?.meta_keywords : "Our Story | Headora "}></meta>
        <meta
          name="robots"
       content="noindex, nofollow"
        />
        <link
          rel="canonical"
          href={`${process.env.baseURL}our-story`}
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={CMSPageData?.title ? CMSPageData?.title : "Our Story | Headora "} />
        <meta
          property="og:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "In the world of retail, it’s hard to know what’s real and if you’re getting a transparent experience. By providing access to an authentic experience where we’re always here to help you shop jewelry and watches, with every piece coming with a digital Authenticity Promise Report, we’re making truth accessible – and revolutionizing modern luxury.. "}
        />
        <meta
          property="og:url"
          content={`${process.env.baseURL}our-story`}
        />
        <meta property="og:site_name" content="Headora" />
        <meta
          property="og:image"
          content={`${process.env.baseURL}Images/OurStoryOGImage.png`}
        />
        <meta
          property="og:image:secure_url"
          content={`${process.env.baseURL}Images/OurStoryOGImage.png`}
        />
        <meta property="og:image:width" content="1408" />
        <meta property="og:image:height" content="787" />
        <meta
          property="og:image:alt"
          content={CMSPageData?.title ? CMSPageData?.title : "Our Story | Headora "}
        />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={CMSPageData?.title ? CMSPageData?.title : "Our Story | Headora "} />
        <meta
          name="twitter:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "In the world of retail, it’s hard to know what’s real and if you’re getting a transparent experience. By providing access to an authentic experience where we’re always here to help you shop jewelry and watches, with every piece coming with a digital Authenticity Promise Report, we’re making truth accessible – and revolutionizing modern luxury.. "}
        />
        <meta
          name="twitter:image"
          content={`${process.env.baseURL}Images/OurStoryOGImage.png`}
        />
        <meta name="twitter:label1" content="Time to read" />
        <meta name="twitter:data1" content="1 minute" />
      </Head>
       <div className="returns_page_free_space"></div>
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />


        </>
    )
}
export default OurStory


export async function getStaticProps() {
  const client = new Client();
  let CMSPageData = null;

  try {
    CMSPageData = await client.fetchOurStoryCMSPages();

  } catch (error) {

  }

  return {
    props: {
      CMSPageData,
   
    },


  };
}



