// import { useEffect, useState } from 'react';
// import styles from '../../styles/Ribbon.module.css';
// function TopRibbon({ribbonResponce}:any) {
//     const sanitizedHtml = ribbonResponce?.cmsBlocks?.items?.[0]?.content ;

//     return (
//         <>
//       <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
//         </>
//     )   
// }
// export default TopRibbon

import { useEffect, useState } from "react";
import styles from "../../styles/Ribbontop.module.css";
import { useRouter } from "next/router";
import Link from "next/link";

function Ribbon() {
  const router = useRouter();
  const [showRibbon, setShowRibbon] = useState(true);

  useEffect(() => {
    const isRibbonClosed = sessionStorage.getItem("ribbonClosed");
    if (isRibbonClosed === "true") {
      setShowRibbon(false);
    }
  }, []);

  const handleClose = () => {
    setShowRibbon(false);
    sessionStorage.setItem("ribbonClosed", "true");
  };

  if (!showRibbon) return null;

  return (
    <div className={styles.headerRibbon} id="header_ribbon">
  <div className={styles.row}>
    <div className={styles.topLeft}></div>

    <div className={styles.centre}>
      <a
        title="40% Off"
        onClick={() => console.log("40% Off Partners Clicked")}
      >
        Up to 40% Off – Limited Time Only
      </a>
    </div>

    <div className={styles.topRight}>
      <div className={styles.RibbonIcon}></div>
    </div>

    {/* NEW: Close button pushed to right */}
    <button
      onClick={handleClose}
      className={styles.closeButton}
      aria-label="Close Ribbon"
      title="Close"
    >
      ✕
    </button>
  </div>
</div>
  );
}

export default Ribbon;
