"use client"

import { useEffect } from "react"
import { Client } from "@/graphql/client"
import Head from "next/head"


function Press({ CMSPageData, showRibbon }: any) {
  const sanitizedHtml = CMSPageData?.data?.cmsPage?.content

  useEffect(() => {
    setTimeout(() => {
    // Initialize slider functionality
    const initSlider = () => {
      const slider = document.querySelector(".press-video-list") as HTMLElement
      const prevBtn = document.querySelector(".bx-prev") as HTMLElement
      const nextBtn = document.querySelector(".bx-next") as HTMLElement

      if (!slider || !prevBtn || !nextBtn) return

      let slideIndex = 0
      const slideWidth = 355 + 40 // Width + margin
      const visibleSlides = Math.floor(slider.parentElement!.offsetWidth / slideWidth)
      const totalSlides = document.querySelectorAll(".press-video-item:not(.bx-clone)").length

      // Set initial position
      slider.style.transform = `translateX(-${slideIndex * slideWidth}px)`

      // Click events for navigation
      prevBtn.addEventListener("click", () => {
        if (slideIndex > 0) {
          slideIndex--
        } else {
          slideIndex = totalSlides - visibleSlides
        }
        slider.style.transform = `translateX(-${slideIndex * slideWidth}px)`
      })

      nextBtn.addEventListener("click", () => {
        if (slideIndex < totalSlides - visibleSlides) {
          slideIndex++
        } else {
          slideIndex = 0
        }
        slider.style.transform = `translateX(-${slideIndex * slideWidth}px)`
      })

      // Add click events to video items
      const videoItems = document.querySelectorAll(".press-video-item")
      videoItems.forEach((item) => {
        item.addEventListener("click", () => {
          // You can implement video modal functionality here
          console.log("Video clicked:", item.id)
        })
      })

      // Add click events to press links
      const pressLinks = document.querySelectorAll(".press-link")
      pressLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          const id = (e.currentTarget as HTMLElement).id
          if (id) {
            console.log("Press link clicked:", id)
            // Implement link functionality here
          }
        })
      })
    }

    // Initialize after content is loaded
    if (sanitizedHtml) {
      setTimeout(initSlider, 100)
    }

    // Responsive handling
    window.addEventListener("resize", initSlider)
    return () => window.removeEventListener("resize", initSlider)

}, 2000);
  }, [sanitizedHtml, showRibbon])

  return (
    <>
       <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{CMSPageData?.title ? CMSPageData?.title : "Headora Press | Headora "}</title>
        <meta
          name="description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "PEOPLE ARE TALKING ABOUT US"}
        />
        <meta name="keywords" content={CMSPageData?.meta_keywords ? CMSPageData?.meta_keywords : "Headora Press | Headora "}></meta>
        <meta
          name="robots"
       content="noindex, nofollow"
        />
        <link
          rel="canonical"
          href={`${process.env.baseURL}press`}
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={CMSPageData?.title ? CMSPageData?.title : "Headora Press | Headora "} />
        <meta
          property="og:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "PEOPLE ARE TALKING ABOUT US"}
        />
        <meta
          property="og:url"
          content={`${process.env.baseURL}press`}
        />
        <meta property="og:site_name" content="Headora" />
        <meta
          property="og:image"
          content={`${process.env.baseURL}/PressOGImage.png`}
        />
        <meta
          property="og:image:secure_url"
          content={`${process.env.baseURL}/PressOGImage.png`}
        />
        <meta property="og:image:width" content="1769" />
        <meta property="og:image:height" content="765" />
        <meta
          property="og:image:alt"
          content={CMSPageData?.title ? CMSPageData?.title : "Headora Press | Headora "}
        />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={CMSPageData?.title ? CMSPageData?.title : "Headora Press | Headora "} />
        <meta
          name="twitter:description"
          content={CMSPageData?.meta_description ? CMSPageData?.meta_description : "PEOPLE ARE TALKING ABOUT US"}
        />
        <meta
          name="twitter:image"
          content={`${process.env.baseURL}/PressOGImage.png`}
        />
        <meta name="twitter:label1" content="Time to read" />
        <meta name="twitter:data1" content="1 minute" />
      </Head>
      <div className="PressFreeSpace">  </div>
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    
    </>
  )
}

export default Press

export async function getStaticProps() {
  const client = new Client()
  let CMSPageData = null

  try {
    CMSPageData = await client.fetchPressCMSPages()
  } catch (error) {
    console.error("Error fetching CMS data:", error)
  }

  return {
    props: {
      CMSPageData,
    },
  }
}
