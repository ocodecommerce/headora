
import styles from "../../styles/ProductDetail.module.css";
// const Data:any ={
//     "Men's Watches": [
//       {
//         "Patek Philippe": true,
//         "Breguet": true,
//         "A. Lange & Sohne": true
//       },
//       {
//         "Rolex": true,
//         "IWC": true,
//         "Jaeger Lecoultre": true
//       },
//       {
//         "Omega": true,
//         "Breitling": true,
//         "Longines": true,
//         "Tissot": true,
//         "Tudor": true
//       },
//       {
//         "Audemars Piguet": true,
//         "Hublot": true,
//         "Panerai": true,
//         "Franck Muller": true,
//         "Bell & Ross": true
//       },
//       {
//         "Movado": true,
//         "Rado": true,
//         "Baume & Mercier": true,
//         "Ebel": true,
//         "Oris": true,
//         "Tag": true
//       },
//       {
//         "Chanel": true,
//         "Chopard": true,
//         "Piaget": true,
//         "Cartier": true
//       },
//       {
//         "Ulysse Nardin": true,
//         "Vacheron Constantin": true,
//         "Zenith": true,
//         "Roger Dubuis": true
//       }
//     ],
//     "Women's Watches": [
//       {
//         "Cartier": true,
//         "Chanel": true,
//         "Hermes": true,
//         "Rolex": true
//       },
//       {
//         "Michele": true,
//         "Michael Kors": true
//       }
//     ],
//     "Jewelry": [
//       {
//         "Cartier": true,
//         "Bulgari": true,
//         "Tiffany & Co.": true,
//         "Chopard": true,
//         "Van Cleef & Arpels": true
//       },
//       {
//         "David Yurman": true,
//         "Roberto Coin": true,
//         "Damiani": true,
//         "Chimento": true,
//         "Mikimoto": true
//       },
//       {
//         "Chanel": true,
//         "Hermes": true,
//         "Charriol": true,
//         "Gucci": true
//       },
//       {
//         "Ippolita": true,
//         "Pomellato": true,
//         "Pasquale Bruni": true
//       }
//     ],
//     "Handbags": [
//       {
//         "Louis Vuitton": true,
//         "Chanel": true,
//         "Gucci": true,
//         "Yves Saint Laurent": true,
//         "Hermes": true
//       }
//     ]
//   }
  

  function RelatedBrands({ RelatedCategories, categoriesList }: any) {
  
    const brandsCategory = categoriesList.data.categories.items?.[0]?.children.find(
      (category: any) => category.name.toLowerCase() === "brands",
    )
    // console.log(RelatedCategories,"RelatedCategories",brandsCategory,"brandsCategory")
    let RelatedCategory:any = ""
    let Data = categoriesList?.data?.categories?.items?.[0]?.children
    const relatedBrands:any = Data[RelatedCategory];
  
    if (!relatedBrands) return null;
  
    // Flatten and extract brand names
    const brands = relatedBrands.flatMap((brandGroup: {}) => Object.keys(brandGroup));
  
    return (
      <div className={styles.relatedBrandsContainer}>
        <h2 className={styles.relatedBrandsTitle}>BRANDS YOU MAY ALSO LIKE</h2>
        <div className={styles.brandGrid}>
          {brands.map((brand:any, index:any) => (
            <div key={index} className={styles.brandCard}>
              {brand.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  export default RelatedBrands;