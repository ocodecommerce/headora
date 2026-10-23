import { Client } from "@/graphql/client";
import Head from "next/head";
import styles from "@/styles/VeniaCms.module.css";
import { preparePageBuilder } from "@/lib/pagebuilder";

function PrivacyPolicy({CMSPageData}:any){
    const sanitizedHtml = CMSPageData?.data?.cmsPage?.content;
    return(
        <>
            <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{CMSPageData?.title ? CMSPageData?.title : "Privacy Policy | Headora"}</title>
        <meta
          name="description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "This Privacy Policy sets forth Headora's policy with respect to personally identifiable information and other information that is collected from Site visitors and Registered Users. "}
        />
        <meta name="keywords" content={CMSPageData?.meta_keywords ? CMSPageData?.meta_keywords : "Privacy Policy | Headora"}></meta>
        <meta
          name="robots"
       content="noindex, nofollow"
        />
        <link
          rel="canonical"
          href={`${process.env.baseURL}privacy-policy/`}
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={CMSPageData?.title ? CMSPageData?.title : "Privacy Policy | Headora"} />
        <meta
          property="og:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "This Privacy Policy sets forth Headora's policy with respect to personally identifiable information and other information that is collected from Site visitors and Registered Users. "}
        />
        <meta
          property="og:url"
          content={`${process.env.baseURL}privacy-policy/`}
        />
        <meta property="og:site_name" content="Headora" />
        <meta
          property="og:image"
          content={`${process.env.baseURL}/Images/PrivacyPolicyOGImage.png`}
        />
        <meta
          property="og:image:secure_url"
          content={`${process.env.baseURL}/Images/PrivacyPolicyOGImage.png`}
        />
        <meta property="og:image:width" content="1133" />
        <meta property="og:image:height" content="710" />
        <meta
          property="og:image:alt"
          content={CMSPageData?.title ? CMSPageData?.title : "Privacy Policy | Headora"}
        />
        <meta property="og:image:type" content="image/jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={CMSPageData?.title ? CMSPageData?.title : "Privacy Policy | Headora"} />
        <meta
          name="twitter:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "This Privacy Policy sets forth Headora's policy with respect to personally identifiable information and other information that is collected from Site visitors and Registered Users. "}
        />
        <meta
          name="twitter:image"
          content={`${process.env.baseURL}/Images/PrivacyPolicyOGImage.png`}
        />
        <meta name="twitter:label1" content="Time to read" />
        <meta name="twitter:data1" content="1 minute" />
      </Head>
        <article id="html-body" className={styles.root}>
          {CMSPageData?.data?.cmsPage?.content_heading ? <h1 className={styles.heading}>{CMSPageData.data.cmsPage.content_heading}</h1> : null}
          <div dangerouslySetInnerHTML={{ __html: preparePageBuilder(sanitizedHtml ?? "") }} />
        </article>

        </>
    )
}
export default PrivacyPolicy

export async function getStaticProps() {
  const client = new Client();
  let CMSPageData = null;


  try {
    CMSPageData = await client.fetchPrivacyPolicyCMSPages();
    // No "privacy-policy" CMS page in Magento: use Magento's built-in privacy page.
    if (!CMSPageData?.data?.cmsPage) {
      const res = await fetch(`${process.env.magentoEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `{ cmsPage(identifier: "privacy-policy-cookie-restriction-mode") { title content_heading content meta_description meta_keywords } }` }),
      });
      CMSPageData = await res.json();
    }
  } catch (error) {

  }


  return {
    props: {
      CMSPageData,
   
    },

  };
}
