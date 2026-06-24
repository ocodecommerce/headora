import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Layout from "@/components/Layout/layout";
import "@/styles/globals.css";
import { useEffect, useState } from "react";
import MobileHeader from "@/components/Header/MobileHeader";
import TopRibbon from "@/components/TopRibbon/TopRibbon";
import { AuthProvider } from "../context/auth-context";
import { Client } from "@/graphql/client";


function App({ 
  Component, 
  pageProps, 
  categoriesList, 
  MegaMenu, 
  BoutiqueCategoriesList, 
  ribbonResponce 
}: any) {

  const [showRibbon, setShowRibbon] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowRibbon(window.scrollY === 0);
    window.addEventListener("scroll", handleScroll);
    
    const timer = setTimeout(() => setShowRibbon(true), 800);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Skip user sync on localhost to avoid CORS
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      console.log("Skipping user sync on localhost");
      return;
    }

    fetch(`${process.env.baseURL}fcprofile/sync/index`)
      .then(res => res.json())
      .then(user => sessionStorage.setItem("userSyncData", JSON.stringify(user)))
      .catch(err => console.error("User sync error:", err));
  }, []);

  return (
    <AuthProvider>
      <Layout>
        {showRibbon && <TopRibbon ribbonResponce={ribbonResponce} />}
        {/* {showRibbon && <Ribbon isMobile={isMobile} />} */}

        <MobileHeader 
          categoriesList={categoriesList} 
          BoutiqueCategoriesList={BoutiqueCategoriesList} 
        />

        <Header 
          categoriesList={categoriesList} 
          megamenu={MegaMenu} 
          BoutiqueCategoriesList={BoutiqueCategoriesList} 
        />

        <Component 
          {...pageProps} 
          isMobile={isMobile} 
          categoriesList={categoriesList} 
          showRibbon={showRibbon} 
        />

        <Footer />
      </Layout>
    </AuthProvider>
  );
}

// Remove getInitialProps completely if possible
// Or keep it minimal like this:
App.getInitialProps = async (ctx: any) => {
  // Only run once at build time or first request
  if (typeof window !== "undefined") return {};

  const client = new Client();
  const [categoriesList, MegaMenu, ribbonResponce, BoutiqueCategoriesList] = await Promise.all([
    client.fetchCategories(),
    client.fetchMegaMenu(),
    client.fetchTopRibbion(),
    client.fetchBoutiqueCategories()
  ]);

  return {
    categoriesList,
    MegaMenu,
    ribbonResponce,
    BoutiqueCategoriesList
  };
};

export default App;