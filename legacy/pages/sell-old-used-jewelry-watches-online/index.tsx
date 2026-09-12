import { Client } from "@/graphql/client";
import Head from "next/head";
import { useEffect } from "react";

function sellOldUsedJewelryWatchesOnline({ CMSPageData, showRibbon }: any) {
  const sanitizedHtml = CMSPageData?.data?.cmsPage?.content;
  useEffect(() => {
    setTimeout(() => {
    setupTooltips();
  }, 2000);
  }, [showRibbon]); // Empty dependency array ensures this runs only once after mount
  

  const setupTooltips = () => {
    // For learn-option1
    const learnOption1:any = document.querySelector('.learn-option1');
    const tooltipA:any = document.querySelector('.tooltip-container.a');
    
    if (learnOption1 && tooltipA) {
      learnOption1.addEventListener('mouseenter', function() {
        tooltipA.style.display = 'block';
        
        // Position the tooltip relative to learn-option1
        const rect = learnOption1.getBoundingClientRect();
        // tooltipA.style.left = (rect.left + rect.width/2) + 'px'; // Center the tooltip (300px/2 = 150px)
        tooltipA.style.top =  '50px'; // Position below with 10px space\
      });
      
      learnOption1.addEventListener('mouseleave', function() {
        tooltipA.style.display = 'none';
      });
      
      // Prevent tooltip from disappearing when hovering over the tooltip itself
      tooltipA.addEventListener('mouseenter', function() {
        tooltipA.style.display = 'block';
      });
      
      tooltipA.addEventListener('mouseleave', function() {
        tooltipA.style.display = 'none';
      });
    }
    
    // For learn-option2
    const learnOption2:any = document.querySelector('.learn-option2');
    const tooltipB:any = document.querySelector('.tooltip-container.b');
    
    if (learnOption2 && tooltipB) {
      learnOption2.addEventListener('mouseenter', function() {
        tooltipB.style.display = 'block';
        
        const rect = learnOption2.getBoundingClientRect();
         // tooltipA.style.left = (rect.left + rect.width/2) + 'px'; // Center the tooltip (300px/2 = 150px)
         tooltipA.style.top =  '50px'; // Position below with 10px space\
      });
      
      learnOption2.addEventListener('mouseleave', function() {
        tooltipB.style.display = 'none';
      });
      
      tooltipB.addEventListener('mouseenter', function() {
        tooltipB.style.display = 'block';
      });
      
      tooltipB.addEventListener('mouseleave', function() {
        tooltipB.style.display = 'none';
      });
    }
    
    // For learn-option3
    const learnOption3:any = document.querySelector('.learn-option3');
    const tooltipC:any = document.querySelector('.tooltip-container.c');
    
    if (learnOption3 && tooltipC) {
      learnOption3.addEventListener('mouseenter', function() {
        tooltipC.style.display = 'block';
        
        const rect = learnOption3.getBoundingClientRect();
     // tooltipA.style.left = (rect.left + rect.width/2) + 'px'; // Center the tooltip (300px/2 = 150px)
     tooltipA.style.top =  '50px'; // Position below with 10px space\
      });
      
      learnOption3.addEventListener('mouseleave', function() {
        tooltipC.style.display = 'none';
      });
      
      tooltipC.addEventListener('mouseenter', function() {
        tooltipC.style.display = 'block';
      });
      
      tooltipC.addEventListener('mouseleave', function() {
        tooltipC.style.display = 'none';
      });
    }
    
    // For learn-option4 (if needed)
    const learnOption4:any = document.querySelector('.learn-option4');
    const tooltipE:any = document.querySelector('.tooltip-container.d');
    
    if (learnOption4 && tooltipE) {
      learnOption4.addEventListener('mouseenter', function() {
        tooltipE.style.display = 'block';
        
        const rect = learnOption4.getBoundingClientRect();
    // tooltipA.style.left = (rect.left + rect.width/2) + 'px'; // Center the tooltip (300px/2 = 150px)
    tooltipA.style.top =  '50px'; // Position below with 10px space\
      });
      
      learnOption4.addEventListener('mouseleave', function() {
        tooltipE.style.display = 'none';
      });
      
      tooltipE.addEventListener('mouseenter', function() {
        tooltipE.style.display = 'block';
      });
      
      tooltipE.addEventListener('mouseleave', function() {
        tooltipE.style.display = 'none';
      });
    }
    
    // For learn-option5 (if needed)
    const learnOption5:any = document.querySelector('.learn-option5');
    const tooltipF:any = document.querySelector('.tooltip-container.e');
    
    if (learnOption5 && tooltipF) {
      learnOption5.addEventListener('mouseenter', function() {
        tooltipF.style.display = 'block';
        
        const rect = learnOption5.getBoundingClientRect();
         // tooltipA.style.left = (rect.left + rect.width/2) + 'px'; // Center the tooltip (300px/2 = 150px)
         tooltipA.style.top =  '50px'; // Position below with 10px space\
      });
      
      learnOption5.addEventListener('mouseleave', function() {
        tooltipF.style.display = 'none';
      });
      
      tooltipF.addEventListener('mouseenter', function() {
        tooltipF.style.display = 'block';
      });
      
      tooltipF.addEventListener('mouseleave', function() {
        tooltipF.style.display = 'none';
      });
    }
  };

  return (
    
    <>
    <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{CMSPageData?.title ? CMSPageData?.title : "Sell Your Old Used Jewelry, Real Stones, and Watches Online | Headora "}</title>
        <meta
          name="description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "Sell Fast To Millions Of Buyers and Get up to 82% Of The Sale Value Back--Higher Than Any Other Luxury Marketplace"}
        />
        <meta name="keywords" content={CMSPageData?.meta_keywords ? CMSPageData?.meta_keywords : "Sell Your Old Used Jewelry, Real Stones, and Watches Online | Headora "}></meta>
        <meta
          name="robots"
       content="noindex, nofollow"
        />
        <link
          rel="canonical"
          href={`${process.env.baseURL}sell-old-used-jewelry-watches-online/`}
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={CMSPageData?.title ? CMSPageData?.title : "Sell Your Old Used Jewelry, Real Stones, and Watches Online | Headora "} />
        <meta
          property="og:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "Sell Fast To Millions Of Buyers and Get up to 82% Of The Sale Value Back--Higher Than Any Other Luxury Marketplace"}
        />
        <meta
          property="og:url"
          content={`${process.env.baseURL}sell-old-used-jewelry-watches-online/`}
        />
        <meta property="og:site_name" content="Headora" />
        <meta
          property="og:image"
          content={`${process.env.baseURL}/Images/sellOGImage.png`}
        />
        <meta
          property="og:image:secure_url"
          content={`${process.env.baseURL}/Images/sellOGImage.png`}
        />
        <meta property="og:image:width" content="1082" />
        <meta property="og:image:height" content="705" />
        <meta
          property="og:image:alt"
          content={CMSPageData?.title ? CMSPageData?.title : "Sell Your Old Used Jewelry, Real Stones, and Watches Online | Headora "}
        />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={CMSPageData?.title ? CMSPageData?.title : "Sell Your Old Used Jewelry, Real Stones, and Watches Online | Headora "} />
        <meta
          name="twitter:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "Sell Fast To Millions Of Buyers and Get up to 82% Of The Sale Value Back--Higher Than Any Other Luxury Marketplace"}
        />
        <meta
          name="twitter:image"
          content={`${process.env.baseURL}/Images/sellOGImage.png`}
        />
        <meta name="twitter:label1" content="Time to read" />
        <meta name="twitter:data1" content="1 minute" />
      </Head>
      <div className="returns_page_free_space"></div>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </>
  );
}
export default sellOldUsedJewelryWatchesOnline;

export async function getStaticProps() {
  const client = new Client();
  let CMSPageData = null;

  try {
    CMSPageData = await client.fetchSellOldUsedJewelryWatchesOnline();
  } catch (error) {}

  return {
    props: {
      CMSPageData,
    },
  };
}
