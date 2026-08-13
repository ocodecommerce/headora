import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../../styles/Ribbon.module.css";
import { AuthProvider, useAuth } from "../../context/auth-context"; 
import { useRouter } from "next/router";
import Link from "next/link";
import AuthorizedPartners from "../AuthorizedPartners/AuthorizedPartners";

function Ribbon({isMobile}:any) {
  const [showAuthorizedPartners, setShowAuthorizedPartners] = useState(false);

  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const router = useRouter();
console.log(isLoggedIn,'isLoggedIn')
useEffect(() => {
    const checkUserLogin = async () => {
      try {

        let userData = null;
  
        if (!userData) {
          if (typeof window !== "undefined" && window.location.hostname === "localhost") {
            console.log("Skipping API call on localhost due to CORS");
            setIsLoggedIn(false);
            return;
          }
  
          const response = await fetch(`${process.env.baseURL}fcprofile/sync/index`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) throw new Error("Failed to fetch user sync data");
  
          userData = await response.json();
          console.log("Sync API response:", userData);
          sessionStorage.setItem("userSyncData", JSON.stringify(userData));
        }
        console.log(userData,!!userData?.logged_in, "userData");
        setIsLoggedIn(!!userData?.logged_in);
      } catch (error) {
        console.error("Error during user sync:", error);
        setIsLoggedIn(false);
      }
    };
  
    checkUserLogin();
  }, []);


  useEffect(() => {
    const userDataString = sessionStorage.getItem("userSyncData");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setIsLoggedIn(userData.logged_in ?? false);
      } catch (error) {
        console.error("Failed to parse userSyncData:", error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleAuthorizedPartnersClick = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent default anchor behavior
    setShowAuthorizedPartners(true);
  };

  return (
    <>
      {showAuthorizedPartners && (
        <AuthorizedPartners onClose={() => setShowAuthorizedPartners(false)} />
      )}
      <div className={styles.headerRibbon} id="header_ribbon">
        <div className={styles.row}>
          <div className={styles.topLeft}>
            <div className={`${styles.tfLocation} ${styles.active}`}>
              <Link href={`/`}>
                <span className={styles.tfLocationWeb}>
                  {isMobile ? "DEFAULT STORE" : "DEFAULT STORE"}
                </span>
              </Link>
            </div>
            <div className={`${styles.tfLocation} `}>
              <Link href={'/'}>
                <span className={styles.tfLocationWeb}>
                  {isMobile ? "SECOND STORE" : "SECOND STORE"}
                </span>
              </Link>
            </div>
          </div>
          <div className={styles.topRight}>
            <ul className={styles.topNav}>
            
              {/* <li>
                <a title="ABOUT US" href={`${process.env.baseURL}our-story`}>
                  ABOUT US
                </a>
              </li> */}
              {/* {isLoggedIn === true ? (
                <li>
                  <Link href={'/customer/account'}>
                  <Image src="/Images/account.png" height={20} width={20} alt="Account" />
                  </Link>
                </li>
              ) : (
                <li>
                  <a
                    title="Login"
                    className={styles.loginTxt}
                    href="/customer/account/login/"
                  >
                    Login
                  </a>
                  {" | "}
                  <a
                    title="Sign up"
                    id="signUpLink"
                    className={styles.signUpTxt}
                    href="/customer/account/create/"
                  >
                    Signup
                  </a>
                </li>
              )} */}
            </ul>
            <div className={styles.RibbonIcon}>
              {/* <Image
              src="/Images/like.png"
              alt="Like Icon"
              height={24}
              width={24}
            /> */}
              {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
  <path fill="#333333" d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z"/>
</svg> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Ribbon;
