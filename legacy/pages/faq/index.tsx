import { useState } from "react";
import Head from "next/head";
import styles from "../../styles/Faq.module.css";
import FaqDiscription from "@/components/FaqComponents/Faqdiscription";

function Faq() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");
  
    try {
      const response = await fetch(`${process.env.baseURL}contactstorage/post/index`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  console.log(response,"FAQ RESPONSE");
      if (response.ok) {
        setSuccess("Thank you for reaching out. We'll get back to you shortly!");
        setFormData({
          name: "",
          email: "",
          phone_number: "",
          comment: "",
        });
      } else {
        const data = await response.json();
        setError(data?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to submit. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
};

  
  return (
    <>
    
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{"FAQ | Headora"}</title>
        <meta
          name="description"
          content={"Our customer support team prides itself in making each and every customer smile every single day. Happiness guaranteed."}
        />
        <meta name="keywords" content={"FAQ | Headora"}></meta>
        <meta
          name="robots"
       content="noindex, nofollow"
        />
        <link
          rel="canonical"
          href={`${process.env.baseURL}faq/`}
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={"FAQ | Headora"} />
        <meta
          property="og:description"
          content={"Our customer support team prides itself in making each and every customer smile every single day. Happiness guaranteed."}
        />
        <meta
          property="og:url"
          content={`${process.env.baseURL}faq/`}
        />
        <meta property="og:site_name" content="Headora" />
        <meta
          property="og:image"
          content={`${process.env.baseURL}/Images/FAQOGImage.png`}
        />
        <meta
          property="og:image:secure_url"
          content={`${process.env.baseURL}/Images/FAQOGImage.png`}
        />
        <meta property="og:image:width" content="1421" />
        <meta property="og:image:height" content="661" />
        <meta
          property="og:image:alt"
          content={"FAQ | Headora"}
        />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={"FAQ | Headora"} />
        <meta
          name="twitter:description"
          content={"Our customer support team prides itself in making each and every customer smile every single day. Happiness guaranteed."}
        />
        <meta
          name="twitter:image"
          content={`${process.env.baseURL}/Images/FAQOGImage.png`}
        />
        <meta name="twitter:label1" content="Time to read" />
        <meta name="twitter:data1" content="1 minute" />
      </Head>
     

      <div className={styles.container}>
        <div className="sizing_banner">
          <div className="sizing_sec">
            <div className="listHeader">
              <span className="line">&nbsp;</span>
              <p>SIZE &amp; HOW CAN WE HELP YOU?</p>
              <span className="line down">&nbsp;</span>
            </div>
            <h4>WE'D LOVE TO HEAR FROM YOU!</h4>
            <p>
              Our customer support team prides itself in making each and every
              customer smile every single day. <br />
              Happiness guaranteed. If you don't see the answer to your
              questions below, please feel free to email us at{" "}
              <a
                href="mailto:support@Headora.com"
                className={styles.contactEmail}
              >
                support@Headora.com
              </a>{" "}
              or fill out the form below and we'll get back to you within one
              business day.
            </p>
          </div>
        </div>

        <div className={styles.contactWrapper}>
          <div className={styles.contactSection}>
            <div className={styles.contactInfo}>
              <h2 className={styles.contactTitle}>Reach Us At</h2>
              <a
                href="mailto:support@Headora.com"
                className={styles.contactEmail}
              >
                support@Headora.com
              </a>
              <div className={styles.businessHours}>
                <p>Mon-Fri: 10AM - 6PM EST</p>
                <p>Sat-Sun: Closed</p>
              </div>
            </div>
          </div>
          <div className={styles.formSection}>
            <h2 className={styles.formTitle}>SCHEDULE A CALL WITH US</h2>

            <form onSubmit={handleSubmit}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.inputField}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.inputField}
                  required
                />
                <input
                  type="text"
                  name="phone_number"
                  placeholder="Phone Number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={styles.inputField}
                  required
                />
              </div>
              <textarea
                name="comment"
                placeholder="Message"
                value={formData.comment}
                onChange={handleChange}
                className={styles.messageField}
                required
              />
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "SUBMIT"}
              </button>
              {error && <p className={styles.errorMessage}>{error}</p>}
              {success && <p className={styles.successMessage}>{success}</p>}
            </form>
          </div>
        </div>
        <FaqDiscription />
      </div>
    </>
  );
}

export default Faq;
