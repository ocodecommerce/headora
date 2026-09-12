import { Client } from "@/graphql/client";
import styles from "../../styles/AuthenticityPromise.module.css"
import Link from "next/link";
import Head from "next/head";

function AuthenticityPromise({ CMSPageData }: any) {
    const sanitizedHtml = CMSPageData?.data?.cmsPage?.content;

    return (

        <>
         <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{CMSPageData?.title ? CMSPageData?.title : "Authenticity Promise | Headora"}</title>
        <meta
          name="description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "The Headora Authenticity Promise"}
        />
        <meta name="keywords" content={CMSPageData?.meta_keywords ? CMSPageData?.meta_keywords : "Authenticity Promise | Headora"}></meta>
        <meta
          name="robots"
       content="noindex, nofollow"
        />
        <link
          rel="canonical"
          href={`${process.env.baseURL}returns/`}
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={CMSPageData?.title ? CMSPageData?.title : "Authenticity Promise | Headora"} />
        <meta
          property="og:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "The Headora Authenticity Promise"}
        />
        <meta
          property="og:url"
          content={`${process.env.baseURL}authenticity-promise/`}
        />
        <meta property="og:site_name" content="Headora" />
        <meta
          property="og:image"
          content={`${process.env.baseURL}/Images/authenticity-promise-og-image.png`}
        />
        <meta
          property="og:image:secure_url"
          content={`${process.env.baseURL}/Images/authenticity-promise-og-image.png`}
        />
        <meta property="og:image:width" content="833" />
        <meta property="og:image:height" content="609" />
        <meta
          property="og:image:alt"
          content={CMSPageData?.title ? CMSPageData?.title : "Authenticity Promise | Headora"}
        />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={CMSPageData?.title ? CMSPageData?.title : "Authenticity Promise | Headora"} />
        <meta
          name="twitter:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "The Headora Authenticity Promise"}
        />
        <meta
          name="twitter:image"
          content={`${process.env.baseURL}/Images/authenticity-promise-og-image.png`}
        />
        <meta name="twitter:label1" content="Time to read" />
        <meta name="twitter:data1" content="1 minute" />
      </Head>
        <div className={styles.navBarSpace}></div>
        <nav className={styles.breadcrumbNav}>
                <Link className={styles.breadcrumbItem} href={'/'}>Home</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbItemEnd}>Authenticity Promise</span>
            </nav>
            <div
                dangerouslySetInnerHTML={{
                    __html: sanitizedHtml,
                }}
            />
        </>
    )
}
export default AuthenticityPromise


export async function getStaticProps() {
    const client = new Client();
    let CMSPageData = null;

    try {
        CMSPageData = await client.fetchAuthenticityPromisePage();
    } catch (error) {

    }

    return {
        props: {
            CMSPageData,
        },
    };
}
