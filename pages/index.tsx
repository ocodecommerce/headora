import Head from "next/head";
import { Client } from "@/graphql/client";
import { useEffect, useRef, useState } from "react";
import Hero from "@/components/HomePage/hero";
export default function Home({ CMSPageData, BouitqueCMSPages, showRibbon }: any) {

  const sliderRef = useRef<HTMLDivElement | null>(null);

  // Function to transform product URLs and truncate product names
  const transformProductUrls = (htmlContent: string): string => {
    if (!htmlContent) return htmlContent

    // Regular expression to find URLs within product-item-info divs
    const urlPattern = /href="https:\/\/www\.Headoranft\.com\/[^"]*"/g

    return htmlContent.replace(urlPattern, (match) => {
      // Extract the URL from the href attribute
      const url = match.replace(/href="([^"]*)"/, "$1")

      // Skip if it's not a product URL or already in correct format
      if (!url.includes("/default/") && !url.includes("/catalog/product/view/")) {
        return match
      }

      let transformedUrl = ""

      // Handle URLs like: /default/cross-pendant-p000905014w.html
      if (url.includes("/default/") && !url.includes("/catalog/product/view/")) {
        const parts = url.split("/default/")
        if (parts.length === 2) {
          const slug = parts[1]
          transformedUrl = `https://www.Headoranft.com/${slug}`
        }
      }
      // Handle URLs like: /default/catalog/product/view/id/4076078/s/pre-owned-rolex-daytona-116523-steel-yellow-gold-watch/
      else if (url.includes("/catalog/product/view/id/") && url.includes("/s/")) {
        const slugMatch = url.match(/\/s\/([^/]+)\/?$/)
        if (slugMatch && slugMatch[1]) {
          let slug = slugMatch[1]
          // Ensure it ends with .html
          if (!slug.endsWith(".html")) {
            slug += ".html"
          }
          transformedUrl = `https://www.Headoranft.com/${slug}`
        }
      }

      // If transformation was successful, return the new href
      if (transformedUrl) {
        return `href="${transformedUrl}"`
      }

      // Return original if transformation failed
      return match
    })
  }

  // Apply URL transformation to the sanitized HTML
  const sanitizedHtml = CMSPageData?.data?.cmsPage?.content?.replace(/\/cache\/[a-f0-9]+\/+/g, "/")

  // Transform the URLs in the HTML content
  const transformedHtml = transformProductUrls(sanitizedHtml)

// ================== Hero Slider ==================
useEffect(() => {
  const container = sliderRef.current;
  if (!container) return;

  let timer: NodeJS.Timeout;

  const timeout = setTimeout(() => {
    const slides = Array.from(
      container.querySelectorAll(".hero_section_slide")
    ) as HTMLElement[];

    const bulletsWrap = container.querySelector(".slider_bullets");
    const prevBtn = container.querySelector(".hero_section .prev");
    const nextBtn = container.querySelector(".hero_section .next");

    if (!slides.length || !bulletsWrap) return;

    bulletsWrap.innerHTML = "";

    let index = 0;

    const show = (i: number) => {
      slides[index].classList.remove("active");
      dots[index].classList.remove("active");

      index = (i + slides.length) % slides.length;

      slides[index].classList.add("active");
      dots[index].classList.add("active");
    };

    const resetAutoplay = () => {
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 5000);
    };

    const goTo = (i: number) => {
      show(i);
      resetAutoplay();
    };

    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "hero_dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      bulletsWrap.appendChild(dot);
      return dot;
    });

    timer = setInterval(() => show(index + 1), 5000);

    const prevHandler = () => goTo(index - 1);
    const nextHandler = () => goTo(index + 1);

    prevBtn?.addEventListener("click", prevHandler);
    nextBtn?.addEventListener("click", nextHandler);

    // -----------------------
    // Mouse + Touch Drag
    // -----------------------
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handlePointerDown = (e: PointerEvent) => {
      startX = e.clientX;
      currentX = e.clientX;
      isDragging = true;
      // container.style.cursor = "grabbing";
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      currentX = e.clientX;
    };

    const handlePointerUp = () => {
      if (!isDragging) return;

      isDragging = false;
      // container.style.cursor = "grab";

      const diff = currentX - startX;

      if (Math.abs(diff) < 60) return;

      if (diff < 0) {
        goTo(index + 1);
      } else {
        goTo(index - 1);
      }
    };

    // container.style.cursor = "grab";
    container.style.userSelect = "none";

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // Store cleanup on the container so the effect cleanup can call it
    (container as any).__sliderCleanup = () => {
      clearInterval(timer);

      prevBtn?.removeEventListener("click", prevHandler);
      nextBtn?.removeEventListener("click", nextHandler);

      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, 100);

  return () => {
    clearTimeout(timeout);

    if ((container as any).__sliderCleanup) {
      (container as any).__sliderCleanup();
      delete (container as any).__sliderCleanup;
    }
  };
}, [transformedHtml, showRibbon]);



// ================== New Products Widget Slider ==================
useEffect(() => {
  const container = sliderRef.current;
  if (!container) return;

  setTimeout(() => {
    const grid = container.querySelector(
      ".block.widget.block-new-products .products-grid"
    ) as HTMLElement;
    const track = grid?.querySelector(".product-items") as HTMLElement;
    if (!grid || !track) return;

    // avoid double-wiring on re-render
    if (grid.querySelector(".products-slider-prev")) return;

    const prevBtn = document.createElement("button");
    prevBtn.className = "products-slider-prev";
    prevBtn.setAttribute("aria-label", "Previous products");
    prevBtn.innerHTML = "&#8592;";

    const nextBtn = document.createElement("button");
    nextBtn.className = "products-slider-next";
    nextBtn.setAttribute("aria-label", "Next products");
    nextBtn.innerHTML = "&#8594;";

    grid.style.position = "relative";
    grid.appendChild(prevBtn);
    grid.appendChild(nextBtn);

    // scroll by however many cards are currently visible (5 desktop / 3 tablet / 2 mobile)
    const getStep = () => {
      const card = track.querySelector(".product-item") as HTMLElement;
      if (!card) return track.clientWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap || "24");
      return card.getBoundingClientRect().width + gap;
    };

    const updateDisabled = () => {
      const max = track.scrollWidth - track.clientWidth - 1;
      prevBtn.setAttribute("data-disabled", String(track.scrollLeft <= 0));
      nextBtn.setAttribute("data-disabled", String(track.scrollLeft >= max));
    };

    const scrollByStep = (dir: 1 | -1) => {
      track.scrollBy({ left: getStep() * dir, behavior: "smooth" });
    };

    prevBtn.addEventListener("click", () => scrollByStep(-1));
    nextBtn.addEventListener("click", () => scrollByStep(1));
    track.addEventListener("scroll", updateDisabled);
    window.addEventListener("resize", updateDisabled);
    updateDisabled();

    // drag-to-scroll on desktop
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    track.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX;
      startScroll = track.scrollLeft;
    });
    window.addEventListener("mouseup", () => (isDown = false));
    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      track.scrollLeft = startScroll - (e.pageX - startX);
    });

    return () => {
      prevBtn.removeEventListener("click", () => scrollByStep(-1));
      nextBtn.removeEventListener("click", () => scrollByStep(1));
      track.removeEventListener("scroll", updateDisabled);
      window.removeEventListener("resize", updateDisabled);
    };
  }, 1000);
}, [transformedHtml, showRibbon]);
  

  // ===========================Meta Tags==================================== 
  const heroImage = transformedHtml?.match(/background-image.*?url\(['"]?(.*?)['"]?\)/)?.[1] || ""
  const fileExtension = heroImage.split('.').pop()?.toLowerCase() || "jpg";
  const pageUrl = `${process.env.baseURLWithoutTrailingSlash}`
  const metaTitle = CMSPageData?.cmsPage?.meta_title || 'Headora';
  const metaDescription = CMSPageData?.cmsPage?.meta_description || 'The #1 marketplace for buying, selling and trading-in fine watches & jewelry. Save on Rolex, Tiffany & Co., Cartier, Omega & more from your favorite brands.';


  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {/* Robots */}
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={pageUrl} />

        {/* Title and Canonical */}
        <title>{metaTitle}</title>


        {/* SEO Meta Tags */}
        <meta name="title" content={metaTitle} />
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={CMSPageData?.cmsPage?.meta_keywords || 'Headora'} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Headora" />

        {/* Open Graph Image */}
        <meta property="og:image" content={heroImage} />
        <meta property="og:image:secure_url" content={heroImage} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="900" />
        <meta property="og:image:type" content={`image/${fileExtension}`} />

        {/* Twitter Meta Tags */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={metaTitle} />
        <meta property="twitter:description" content={metaDescription} />
        <meta property="twitter:image" content={heroImage} />
      </Head>

      {/* ==============Schema=================  */}

      <OrganizationSchema />
      <HomePageSchema HeroBanner={heroImage} metaDescription={metaDescription} />
      {/* Entire Home Page Content is Coming from CMS (Here ↓)  */}
      {/* <Hero/> */}
      <div ref={sliderRef}>
        <div dangerouslySetInnerHTML={{ __html: transformedHtml }} />
      </div>
    </>
  );
}

// ==============Schema Functions==============



const HomePageSchema = ({ HeroBanner, metaDescription }: any) => {

  return (

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Headora",
          "description": metaDescription,
          "image": HeroBanner,
          "mainEntity": {
            "@type": "WebPageElement",
            "name": "Hero Section",
            "description": metaDescription,
            "url": `${process.env.baseURLWithoutTrailingSlash}` // Set this to your call-to-action URL
          }
        }),
      }}
    />

  );
};

const OrganizationSchema = () => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Headora",
          "url": `${process.env.baseURLWithoutTrailingSlash}`,
          "logo": `${process.env.baseURLWithoutTrailingSlash}/Logo/Logo_transparent.png`,
          "contactPoint": [
            {
              "@type": "ContactPoint",
              "telephone": "+1-800-690-3736",
              "contactType": "Customer Service",
              "areaServed": "Worldwide",
              "availableLanguage": ["English"],
            },
          ],
          "sameAs": [
            "https://www.facebook.com/profile.php?id=100088095545673&amp;mibextid=LQQJ4d&amp;rdid=GzonofqiS7wvqQ9V&amp;share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2FhijNeHjqKVeZ4eJM%2F%3Fmibextid%3DLQQJ4d",
            "http://instagram.com/Headora",
            "http://twitter.com/Headora",
            "http://www.pinterest.com/Headora"
          ],
        }),
      }}
    />
  );
};


export async function getStaticProps() {
  const client = new Client();
  let CMSPageData = null;

  try {
    CMSPageData = await client.fetchCMSPages();


  } catch (error) {
    console.error("Error fetching CMS data", error);
  }

  return {
    props: {
      CMSPageData,
    },
  };
}
