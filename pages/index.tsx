import Head from "next/head";
import { Client } from "@/graphql/client";
import { useEffect, useRef, useState } from "react";
import Hero from "@/components/HomePage/hero";

export default function Home({ CMSPageData, BouitqueCMSPages, showRibbon }: any) {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // Function to transform product URLs
  const transformProductUrls = (htmlContent: string): string => {
    if (!htmlContent) return htmlContent;

    const urlPattern = /href="https:\/\/www\.Headora\.com\/[^"]*"/g;

    return htmlContent.replace(urlPattern, (match) => {
      const url = match.replace(/href="([^"]*)"/, "$1");

      if (!url.includes("/default/") && !url.includes("/catalog/product/view/")) {
        return match;
      }

      let transformedUrl = "";

      if (url.includes("/default/") && !url.includes("/catalog/product/view/")) {
        const parts = url.split("/default/");
        if (parts.length === 2) {
          const slug = parts[1];
          transformedUrl = `https://www.Headoranft.com/${slug}`;
        }
      } else if (url.includes("/catalog/product/view/id/") && url.includes("/s/")) {
        const slugMatch = url.match(/\/s\/([^/]+)\/?$/);
        if (slugMatch && slugMatch[1]) {
          let slug = slugMatch[1];
          if (!slug.endsWith(".html")) {
            slug += ".html";
          }
          transformedUrl = `https://www.Headoranft.com/${slug}`;
        }
      }

      if (transformedUrl) {
        return `href="${transformedUrl}"`;
      }

      return match;
    });
  };

  const sanitizedHtml = CMSPageData?.data?.cmsPage?.content?.replace(
    /\/cache\/[a-f0-9]+\/+/g,
    "/"
  );

  const transformedHtml = transformProductUrls(sanitizedHtml);

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

      // Mouse + Touch Drag
      let startX = 0;
      let currentX = 0;
      let isDragging = false;

      const handlePointerDown = (e: PointerEvent) => {
        startX = e.clientX;
        currentX = e.clientX;
        isDragging = true;
      };

      const handlePointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        currentX = e.clientX;
      };

      const handlePointerUp = () => {
        if (!isDragging) return;

        isDragging = false;
        const diff = currentX - startX;

        if (Math.abs(diff) < 60) return;

        if (diff < 0) {
          goTo(index + 1);
        } else {
          goTo(index - 1);
        }
      };

      container.style.userSelect = "none";

      container.addEventListener("pointerdown", handlePointerDown);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);

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

  // =========================== Meta Tags ============================

  const baseUrl = (process.env.baseURLWithoutTrailingSlash || "").replace(/\/$/, "");

  // Extract hero image more reliably
  const rawHeroImage =
    transformedHtml?.match(/background-image.*?url\(['"]?(.*?)['"]?\)/)?.[1] ||
    transformedHtml?.match(/src=['"]([^'"]+\.(?:jpg|jpeg|png|webp|avif))['"]/i)?.[1] ||
    "";

  const heroImage = rawHeroImage
    ? rawHeroImage.startsWith("http")
      ? rawHeroImage
      : `${baseUrl}${rawHeroImage.startsWith("/") ? "" : "/"}${rawHeroImage}`
    : `${baseUrl}/Logo/Logo.png`; // solid fallback

  const fileExtension =
    heroImage.split(".").pop()?.toLowerCase()?.split("?")[0] || "png";

  const pageUrl = baseUrl || "https://www.headora.com";

  const metaTitle =
    CMSPageData?.data?.cmsPage?.meta_title ||
    CMSPageData?.cmsPage?.meta_title ||
    "Headora | Ocode Commerce";

  const metaDescription =
    CMSPageData?.data?.cmsPage?.meta_description ||
    CMSPageData?.cmsPage?.meta_description ||
    "Headora Ocode Commerce Company.";

  const metaKeywords =
    CMSPageData?.data?.cmsPage?.meta_keywords ||
    CMSPageData?.cmsPage?.meta_keywords ||
    "Headora, OcodeCommerce";

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />

        {/* Robots – home page should be indexed */}
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={pageUrl} />

        {/* Title */}
        <title>{metaTitle}</title>

        {/* SEO Meta Tags */}
        <meta name="title" content={metaTitle} />
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="Headora" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={heroImage} />
        <meta property="og:image:secure_url" content={heroImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content={`image/${fileExtension}`} />

        {/* Twitter – use name= not property= */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={heroImage} />
      </Head>

      {/* Schemas */}
      <OrganizationSchema baseUrl={pageUrl} />
      <HomePageSchema
        baseUrl={pageUrl}
        heroImage={heroImage}
        metaTitle={metaTitle}
        metaDescription={metaDescription}
      />

      {/* CMS Content */}
      <div ref={sliderRef}>
        <div dangerouslySetInnerHTML={{ __html: transformedHtml }} />
      </div>
    </>
  );
}

// ============== Schema Components ==============

const HomePageSchema = ({
  baseUrl,
  heroImage,
  metaTitle,
  metaDescription,
}: {
  baseUrl: string;
  heroImage: string;
  metaTitle: string;
  metaDescription: string;
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: metaTitle,
    description: metaDescription,
    url: baseUrl,
    image: heroImage,
    isPartOf: {
      "@type": "WebSite",
      name: "Headora",
      url: baseUrl,
    },
    mainEntity: {
      "@type": "WebPageElement",
      name: "Hero Section",
      description: metaDescription,
      url: baseUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

const OrganizationSchema = ({ baseUrl }: { baseUrl: string }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Headora",
    url: baseUrl,
    logo: `${baseUrl}/Logo/Logo.png`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+1-800-690-3736",
        contactType: "customer service",
        areaServed: "US",
        availableLanguage: ["English"],
      },
    ],
    sameAs: [
      "https://www.facebook.com/Headora",
      "https://www.instagram.com/Headora",
      "https://twitter.com/Headora",
      "https://www.pinterest.com/Headora",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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