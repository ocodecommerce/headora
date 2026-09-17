import { Client } from '@/graphql/client';
import Head from 'next/head';
import React from 'react';

function Custom404({ CMSPageData }: any) {
  const sanitizedHtml = CMSPageData?.data?.cmsPage?.content ?? '<h1>Page Not Found</h1>';

  return (
    <>
      <Head>
        <title>Page not Found</title>
      </Head>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </>
  );
}

export default Custom404;

export async function getStaticProps() {
  const client = new Client();
  let CMSPageData: any = null;

  try {
    const data = await client.fetchNotFoundPage();
    CMSPageData = data ?? null; // Ensure not undefined
  } catch (error) {
    console.error('Error fetching 404 CMS page:', error);
    CMSPageData = null;
  }

  return {
    props: {
      CMSPageData,
    },
  };
}
