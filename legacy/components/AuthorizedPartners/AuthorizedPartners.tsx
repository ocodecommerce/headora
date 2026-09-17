import { useEffect } from 'react';
import styles from '../../styles/AuthorizedPartners.module.css';
import Image from 'next/image';

interface Props {
  onClose: () => void;
}

 
function AuthorizedPartners({ onClose }: Props) {
useEffect(() => {
  const html = document.documentElement;
  html.style.overflowY = 'hidden';

  return () => {
    html.style.overflowY = ''; // reset on unmount
  };
}, []);

    return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <div className={styles.logo}>
          <Image src="/Logo/TF_Full_Logo.png" alt="Headora Logo" width={180} height={40} />
        </div>
        <p className={styles.description}>
          Headora is an authorized partner of a growing list of luxury watch and jewelry brands
          to bring you an immersive online shop all in one place.
        </p>
        <div className={styles.scrollBox}>
          <Image src="/Images/Fendi.png" alt="Fendi" width={150} height={70} />
          <Image src="/Images/frederique_constant_1.jpg" alt="Frederique Constant" width={220} height={90} />
          <Image src="/Images/manufacture_royale.jpg" alt="Manufacture Royale" width={220} height={80} />
          <Image src="/Images/mimi_so.jpg" alt="Mimi So" width={150} height={70} />
          <Image src="/Images/misahara.jpg" alt="Misahara" width={180} height={80} />
          <Image src="/Images/nanis.jpg" alt="Nanis" width={250} height={100} />
          <Image src="/Images/phillips_house.jpg" alt="Phillips House" width={200} height={80} />
          <Image src="/Images/zydo.jpg" alt="Zydo" width={160} height={70} />
          <Image src="/Images/tutima.jpg" alt="Tutima" width={250} height={100} />
          <Image src="/Images/hyt.jpg" alt="HYT" width={150} height={50} />
          <Image src="/Images/thumbnail_20.jpg" alt="Franck Dubarry" width={100} height={100} />
          <Image src="/Images/tzuri.jpg" alt="tzuri" width={100} height={100} />
        </div>
        <a href={`${process.env.SecondStoreURL}`} className={styles.shopLink}>
          SHOP BRAND BOUTIQUE
        </a>
      </div>
    </div>
  );
}

export default AuthorizedPartners;
