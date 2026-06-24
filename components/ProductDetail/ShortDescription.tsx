import React, { useEffect, useState } from "react";
import styles from "../../styles/ProductDetail.module.css";
import Link from "next/link"; 


function ProductDescription({ currentVariant }: any) {
  // console.log("Rendering ProductDescription with variant:", currentVariant);
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");

  // ✅ Clean ONLY br issues (keep HTML)
  // const cleanHTML = (html: string) => {
  //   if (!html) return "";

  //   return html
  //     // normalize line breaks
  //     .replace(/(?:\r\n|\r|\n)/g, "<br>")

  //     // remove multiple <br>
  //     .replace(/(<br\s*\/?>\s*){2,}/gi, "<br>")

  //     // remove <br> before </p>
  //     .replace(/<br\s*\/?>\s*<\/p>/gi, "</p>")

  //     // remove <br> after <p>
  //     .replace(/<p>\s*<br\s*\/?>/gi, "<p>")

  //     // fix <p> + <br> + <p>
  //     .replace(/<\/p>\s*<br\s*\/?>\s*<p>/gi, "</p><p>")

  //     .trim();
  // };


  const cleanHTML = (html: string) => {
    if (!html) return "";

    let cleaned = html;

    // normalize line breaks
    cleaned = cleaned.replace(/(?:\r\n|\r|\n)/g, "<br>");

    // remove scripts/styles
    cleaned = cleaned
      .replace(/<style[^>]*>.*?<\/style>/gi, "")
      .replace(/<script[^>]*>.*?<\/script>/gi, "");

    // fix multiple <br>
    cleaned = cleaned.replace(/(<br\s*\/?>\s*){2,}/gi, "</p><p>");

    // remove <br> around <p>
    cleaned = cleaned
      .replace(/<p>\s*<br\s*\/?>/gi, "<p>")
      .replace(/<br\s*\/?>\s*<\/p>/gi, "</p>");

    // fix broken paragraph joins
    cleaned = cleaned.replace(/<\/p>\s*<p>/gi, "</p><p>");

    // if no <p> exists → convert to paragraphs
    if (!cleaned.includes("<p")) {
      cleaned = `<p>${cleaned}</p>`;
    }

    return cleaned.trim();
  };


  useEffect(() => {
    if (!currentVariant) return;

    // ✅ FULL DESCRIPTION (keep HTML)
    let full =
      typeof currentVariant.description === "string"
        ? currentVariant.description
        : currentVariant.description?.html || "";

    full = cleanHTML(full);

    setFullDesc(`<p>${full}</p>`);

    // ✅ SHORT DESCRIPTION (text only)
    let short =
      currentVariant.short_description?.html ||
      currentVariant.short_description ||
      full;

    short = cleanHTML(short);

    // strip tags ONLY for short
    short = short.replace(/<[^>]+>/g, "");

    if (!currentVariant.short_description) {
      short = short.slice(0, 200) + " ...";
    }

    setShortDesc(`<p>${short}</p>`);
  }, [currentVariant]);

  return (
    <div className={styles.productDetailNewDescriptionContainer} >

<p className={styles.sectionHeading}>Description</p>

    
        {/* <div
    className={
      styles.productDetailDescriptionContainer +
      " " +
      styles.productShortDetailDescriptionContainer
    }
  > */}
    {/* <p>
      Headora promises authenticity of our products. Learn more about/
       Headora's{" "}
      <Link href={"/authenticity-promise"}>
        authenticity promise.
      </Link>
    </p> */}

    {/* ✅ Short Description */}
    {/* <div dangerouslySetInnerHTML={{ __html: descriptionHTML }} /> */}
  {/* </div> */}
      {/* SHORT (optional) */}
      {/* 
      <div className={styles.productShortDetailDescriptionContainer}>
        <div dangerouslySetInnerHTML={{ __html: shortDesc }} />
      </div>
      */}

      {/* FULL */}
      <div className={styles.productDetailNewDescriptionContainerss} style={{textAlign:"justify"}}>
        <div dangerouslySetInnerHTML={{ __html: fullDesc }} />
      </div>
    </div>
  );
}

export default ProductDescription;