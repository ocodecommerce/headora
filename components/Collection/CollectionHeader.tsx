// import React from 'react'
// import styles from '../../styles/CollectionPage.module.css'
// import { useRouter } from 'next/router'
// import Image from 'next/image'

// function CollectionHeader({ Data }: any) {

//   const router = useRouter()
//   // const HtmlData = Data?.description
//   const HtmlData = Data?.short_description || null;
 
//   return (
//     <>
//   <div className={styles.collectionBanner}>
//         <section 
//           className={styles.collectionHeroContainer} 
//           style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${Data?.image || "/Images/placeholder-banner.png"})` }} // Add dynamic background image
//         >
//           <div className={styles.collectionHeroContent}>
//             <h1>{Data?.name}</h1>
//             <div className={styles.descrWrapper}>
//               <div className={styles.descr}>
//                 <div dangerouslySetInnerHTML={{ __html:  HtmlData}} />
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>
//     </>
//   )
// }
// export default CollectionHeader
import React from 'react';
import styles from '../../styles/CollectionPage.module.css';
import { useRouter } from 'next/router';
import Image from 'next/image';

function CollectionHeader({ Data }: any) {

  // console.log(Data,"DataDataDataData")
  const router = useRouter();
  const HtmlData = Data?.description || null;
  // const HtmlData = Data?.description || null;

  const stripHtml = (html:any) =>
    html?.replace(/<[^>]*>/g, "").trim();
  
  const truncateText = (text:any, limit = 120) => {
    if (text.length <= limit) return text;
  
    const sliced = text.slice(0, limit);
    return sliced.slice(0, sliced.lastIndexOf(" ")) + "...";
  };
  
  const shortDescription = HtmlData ? truncateText(stripHtml(HtmlData)) : null;

  

  return (
    <>
     <div className={styles.freeSpace}></div>
    <div className={styles.collectionHeaderContainer}
      style={{
        // backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 80%)), url(${Data?.image || "#1a1e25"})`,
        // backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgb(255 222 144 / 41%)), url(${process.env.baseURLForSchema}${Data?.ocode_image || "#1a1e25"})`,
        backgroundRepeat: "no-repeat, no-repeat",
        // backgroundPosition: "center center, calc(100% - 10%) bottom",
        backgroundSize: "cover", 
        backgroundPosition: "right center",
      }}
      > 
      <div className={styles.textContainer}>
        <h1>{Data?.name}</h1>
        {/* <p dangerouslySetInnerHTML={{ __html:  HtmlData}} /> */}
       {HtmlData ? <p>
    {shortDescription}{" "}
    <button
    className={styles.read_more_btn_top}
    onClick={() => {
      const element = document.getElementById("Bottom-description-1");
    
      if (element) {
        const offset = 180;
    
        const top =
          element.getBoundingClientRect().top +
          window.pageYOffset -
          offset;
    
        window.scrollTo({
          top,
          behavior: "smooth",
        });
      }
    }}
    >
      Read More
    </button>
  </p> : null}


        {/* <div className={styles.underline}></div> */}
      </div>
      {/* <div className={styles.imageContainer}>
        <Image
          src={Data?.image || "/Images/placeholder-banner.png"}
          alt="Customer Support"
          width={600}
          height={350}
          className={styles.headerImage}
        />
      </div> */}
    </div>
    </>
  );
}

export default CollectionHeader;
