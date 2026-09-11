import { useState } from 'react';
import styles from '../../styles/Faq.module.css'

function FaqDiscription() {
  

    const handleTabClickone = (id: string) => {
        if (id === "one") {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        } 
    };
    const handleTabClicktwo = (id: string) => {
        if (id === "two") {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        } 
    };
    const handleTabClickthree = (id: string) => {
        if (id === "three") {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        } 
    };
    const handleTabClickfour = (id: string) => {
        if (id === "four") {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        } 
    };

    const handleTabClickfive = (id: string) => {
        if (id === "five") {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        } 
    };
    return (
        <>
            <div className={styles.faqContainer}>
                <h2 className={styles.headerTitle}>Frequently Asked Questions</h2>

                <div className={styles.faqNavbar}>
                    <span className={styles.tab} onClick={() => handleTabClickone("one")}>SHOP</span>
                    <span className={styles.tab} onClick={() => handleTabClicktwo("two")}>SELLING</span>
                    <span className={styles.tab} onClick={() => handleTabClickthree("three")}>SHIPPING</span>
                    <span className={styles.tab} onClick={() => handleTabClickfour("four")}>RETURNS & EXCHANGES</span>
                    <span className={styles.tab} onClick={() => handleTabClickfive("five")}>OTHER</span>
                </div>
                <div id="one" className="faq_group">
                    <div className={styles.sectionHeading}>
                        <h3 className={styles.sectionTitle}>SHOP</h3>
                        <div className={styles.dividerLine}></div>
                    </div>
                    <h4>Are your items authentic?</h4>
                    <p className={styles.contentParagraph}><span>On our pre-loved marketplace, Headora vets the sellers selling jewelry and watches, so you are shopping from the best. If an item is ever deemed to be found inauthentic, our concierge team will help you with the seller to come up with a solution. You also have 7 business days to return your item for a refund. If any items do not fit our rigorous quality standards, they are not accepted. We are also official partners with several brands for certified pre-owned whereby you receive a brand new warranty direct from the brand on your purchase. Just look for the “Brand Certified Pre-owned Stamp” to shop these items. On the Headora Boutique, we are authorized partners for the brands we carry. The items listed on the Boutique come directly from the brands and authenticity is promised.</span></p>
                    <h4>Do items come with original brand packaging and paperwork?</h4>
                    <p className={styles.contentParagraph}>On our pre-loved marketplace not all items come with original brand packaging and paperwork. Each listing provides information on whether the original packaging and paperwork are available. All items come with a Headora Digital Report as part of our process to promise our authenticity service via helping you with the seller and a warranty on watches, if one is included based on the watch. On the Headora Boutique and our Certified Pre-owned program with brands, all items are come directly from the brands and come with the original Manufacturer's packaging and warranty.</p>
                    <h4>If I don't live in the United States, can I still make a purchase?</h4>
                    <p className={styles.contentParagraph}>We ship internationally based on your country. International shipping fees may apply and there may be country specific import taxes and duties that you would be responsible for.</p>
                    <h4>Where can I use my store credit and coupons?</h4>
                    <p className={styles.contentParagraph}>You can apply Headora store credit and coupons by simply going to the "Checkout Page" and entering your coupon code in the "Enter your Coupon Code" field. Then click on the "Apply Coupon" button. Please note, coupon codes are single use and cannot be combined with other promotions or offers.</p>
                    <h4>What forms of payment do you accept?</h4>
                    <p className={styles.contentParagraph}>We accept VISA, MasterCard, American Express, and Discover credit cards, and PayPal.</p>
                    <h4>How does Affirm financing work?</h4>
                    <p className={styles.contentParagraph}>Rates range from 0–36% APR. Payment options through Affirm are subject to an eligibility check and are provided by these lending partners:<br />
                        <a style={{ color: "blue" }} href="https://affirm.com/lenders" target="_blank" rel="noopener noreferrer nofollow">affirm.com/lenders</a>. Options depend on your purchase amount, and a down payment may be required.</p>
                    <p className={styles.contentParagraph}><strong>For California residents:</strong> Loans by Affirm Loan Services, LLC are made or arranged pursuant to a California Financing Law license. For licenses and disclosures, visit<br />
                        <a style={{ color: "blue" }} href="https://affirm.com/licenses" target="_blank" rel="noopener noreferrer nofollow">affirm.com/licenses</a>.</p>
                    <p className={styles.contentParagraph}>For example, an $800 purchase could be split into 12 monthly payments of $72.21 at 15% APR.</p>
                    <h4>Where can I get my ring size?</h4>
                    <p className={styles.contentParagraph}>Click <a href="/how-to-check-size-and-fit/" target='_blank'>here</a> to view "Ring Size and Fit". Print out the instructions and ring size fitter to accurately measure your ring size. This fit guide is also found at the footer the Headora webpage or located in the product details page if you're ordering a ring.</p>
                    <h4>What if the item doesn't fit?</h4>
                    <p className={styles.contentParagraph}>Please contact our concierge associates to help you find the best option for your particular item. Some items are easy to resize while trying to resize other pieces may impact the integrity of the material or design. Some items cannot be resized and any resizing will make it final sale. You can return or exchange your item to Headora if it doesn’t fit.</p>
                    <h4>Can I get my items insured?</h4>
                    <p className={styles.contentParagraph}>You can use an insurance company to get insurance for your item. Depending on the insurance provider, you may need to show them the order confirmation as your receipt and the Headora digital report, as needed.</p>
                    <h4>How does Headora determine the resale price of each item?</h4>
                    <p className={styles.contentParagraph}>Our team of experts assess the jewelry and watch market to calculate a fair resale value. We use millions of data points from the market to determine pricing so that buyers and sellers receive a fair price.</p>
                    <h4>How do I know I'm getting a fair value for my item?</h4>
                    <p className={styles.contentParagraph}>Our team of experts evaluates the market and specifications of the pieces. We pride ourselves in offering the best fair value for both buyers and sellers by analyzing millions of data points from the market.</p>
                    <h4>Can I get my items insured?</h4>
                    <p className={styles.contentParagraph}>Yes. Your order from Headora comes with a Headora Report. You can use this document to get your items covered by your homeowner’s or renter’s insurance policy. Or you can bring it to a third party insurance agency that specializes in fine jewelry and watch insurance.</p>
                    <h4>Do I need to pay sales tax?</h4>
                    <p className={styles.contentParagraph}>Headora is currently obligated to collect sales tax on orders shipped to addresses in New York state. Each state has individual tax laws that specify which purchases are subject to sales tax. People who live in a state without sales tax won't be charged on goods they have shipped to their home state.</p>
                    <h4><span >Does my purchase come with a warranty?</span></h4>
                    <p className={styles.contentParagraph}>On the pre-loved marketplace, never worn watches generally come with a 2-year warranty. Pre-loved watches (excluding vintage) come with a 1-year warranty. The specific details are available on the item’s listing page. Jewelry does not come with warranty, but we are happy to help with light repairs, based on the type of repair. On the Headora Boutique, all jewelry and watches come with a full Manufacturer's Warranty which range from 2-5 years depending on the brand and in our Certified pre-owned program direct with brands, these items come with a 1 or 2 year warranty direct from the brand.</p>
                    <h4>What does custom, refinished or aftermarket mean in the item description?</h4>
                    <p className={styles.contentParagraph}>What does custom, refinished or aftermarket mean in the item description? Some pieces are customized with additional elements by a jeweler or watchmaker after the original purchase. Please note items that have been customized cannot be serviced by the original manufacturer. Items that have custom, refinished or aftermarket parts will be clearly notated in the product detail page.</p>
                </div>
                
                <div id="two" className="faq_group faq-seller">
                    
                    <div className={styles.sectionHeading}>
                        <h3 className={styles.sectionTitle}>SELLING</h3>
                        <div className={styles.dividerLine}></div>
                    </div>
                    <h4 className="sell-select-left">How can I start selling with Headora?</h4>
                    <p className={styles.contentParagraph}>Headora offers two easy ways to sell: consign or list.</p>
                    <p className={styles.contentParagraph}>To consign with Headora, complete a quick Consignment Request Form here and our concierge associates will be in touch with a prepaid insured shipping label. Simply drop your items in the mail and we’ll take care of the rest, including professionally photographing and listing your item.</p>
                    <p className={styles.contentParagraph}>To create your own listing, here. Write a product description and upload photos of your items. Your listing is then reviewed by our team before it goes live on our site.</p>
                    <h4 className="sell-select-right">How does Headora's consignment process work?</h4>
                    <p className={styles.contentParagraph}>To consign with Headora, complete a quick Consignment Request Form here and our concierge associates will be in touch with a prepaid insured shipping label. Then simply drop your items in the mail.</p>
                    <p className={styles.contentParagraph}>Once your package arrives at our offices, we will confirm the receipt of your items via e-mail. Our team of authenticators will appraise your items and provide a free valuation which you can approve or decline. After you approve, we will professionally photograph and list your items on Headora. The complete consignment process typically takes 5-7 days, from the receipt of your item.</p>
                    <p className={styles.contentParagraph}>Items that are deemed inauthentic will not be uploaded for sale. If an item is beyond repair it will be returned to the seller. We require that you allow us 180 days to sell your item. If you want it back prior to the 180 days, there is a $20 fee so we can cover our costs for appraising and shipping. Otherwise, we'll ship it free of charge after the minimum holding period.</p>
                    <h4 className="sell-select-right">How does Headora's listing process work?</h4>
                    <p className={styles.contentParagraph}>To create your own listing, visit here. Write a product description and upload photos of your items. Your listing is then reviewed by our team before it goes live (typically within 48 hours).</p>
                    <h4>How do I know what I’m earning for the items I want to sell?</h4>
                    <p className={styles.contentParagraph}>If you’re selling through our consignment program, our team of authenticators will appraise your items and provide a free valuation which you can approve or decline. Valuation and earn rate is based on several factors including brand, model, condition, and available supply. You can earn up to 80% of the sale price. You do not have to work your way up to a higher commission rate. Our sales and promotions don’t affect your sale price. If you list with Headora, you earn up to 82% of the sale price.</p>
                    <h4>What happens if I don’t approve my offer price when consigning?</h4>
                    <p className={styles.contentParagraph}>We will return your items and require a flat-rate $20 shipping fee to send your items back.</p>
                    <h4>What happens if my items get lost or damaged while shipping to you?</h4>
                    <p className={styles.contentParagraph}>All shipments are fully insured, so, in the unlikely event your item is lost or damaged, you will be fully compensated. To avoid potential damage, securely pack your items with bubble wrap or tissue paper and double box your items with two shipping boxes.</p>
                    <h4>How do you determine the listing price for items?</h4>
                    <p className={styles.contentParagraph}>Every consigned item is valued by an expert appraiser. We also use a pricing engine that is based upon millions of data points including brand and model, comparable market prices, rarity, seasonality, metal type, condition, and quality of stones. We value transparency so whether you’re consigning or shopping with Headora you know you are receiving the best value for your item.</p>
                    <h4>How do you authenticate the items?</h4>
                    <p className={styles.contentParagraph}>Every item we receive goes through an extensive authentication process, conducted by our team of experts. Our authenticators each have over 10 years of training in valuing watches and jewelry. Any items that do not fit our rigorous quality standards or are deemed inauthentic are not accepted by Headora.</p>
                    <h4>What happens if I consign items and then request that they be sent back to me?</h4>
                    <p className={styles.contentParagraph}>You can request your items back at any time. The minimum consignment holding period is 180 days. We can return your items before this end date and require a flat-rate $20 shipping fee to send your consigned items back.</p>
                    <p className={styles.contentParagraph}>If, after 180 days, you request your items back, we will ship it free of charge.</p>
                    <h4>What happens to items that are not sold?</h4>
                    <p className={styles.contentParagraph}>After 180 days you may request to have your items returned. Otherwise, we will continue to merchandise your items for sale.</p>
                    <h4>How do I get paid?</h4>
                    <p className={styles.contentParagraph}>Once your item sells, Headora pays out by mailed check, PayPal or Headora shopping credit, based upon your preference.</p>
                    <h4>When will I receive my payment?</h4>
                    <p className={styles.contentParagraph}>Payments are sent via check or PayPal on the 1st and 15th of the month, after the 7-day return policy from receipt of the item has expired.</p>
                </div>
         
        
                <div id="three" className="faq_group">
                    <div className={styles.sectionHeading}>
                        <h3 className={styles.sectionTitle}>SHIPPING</h3>
                        <div className={styles.dividerLine}></div>
                    </div>
                    <h4>Do you ship internationally?</h4>
                    <p className={styles.contentParagraph}>Yes, we ship internationally based on your country.There would be shipping charges and also may be country specific import taxes and duties that also apply.</p>
                    <h4>How quickly do you ship once a purchase is made?</h4>
                    <p className={styles.contentParagraph}>We ship most items within five business days, unless otherwise noted on the item. All Standard Shipping orders require 7-14 business days for processing. Select items are eligible for expedited shipping. All Headora orders are insured and a signature is required to ensure you receive the item safely. Once the order ships, a shipping confirmation email with a tracking number is sent.</p>
                    <h4>Do you offer free shipping?</h4>
                    <p className={styles.contentParagraph}>Yes! We offer free UPS or FEDEX standard shipping within the United States.</p>
                    <h4>What shipping providers do you use?</h4>
                    <p className={styles.contentParagraph}>We use UPS and FEDEX. Packages are fully insured and shipped with an adult signature required.</p>
                    <h4>Do you deliver to Post Office boxes?</h4>
                    <p className={styles.contentParagraph}>At this time we do not deliver to P.O. Boxes or APO/FPO addresses.</p>
                    <h4>How do I track my order?</h4>
                    <p className={styles.contentParagraph}>Once tracking details are available, you will receive tracking confirmation via email and a link to track your package.</p>
                </div>
         
             
                <div id="four" className="faq_group">
                    <div className={styles.sectionHeading}>
                        <h3 className={styles.sectionTitle}>RETURNS &amp; EXCHANGES</h3>
                        <div className={styles.dividerLine}></div>
                    </div>
                    <h4 className="return-select-left">What is the refund policy and what does this entail?</h4>
                    <p className="return-select-left">All returns must be made within 15 days of receipt and must be in the same condition as it was&nbsp;<span>delivered to you with all security tags and stickers intact. To request a return please email&nbsp;</span><a href="mailto:support@Headora.com" target="_blank">support@Headora.com</a><span>&nbsp;with your order # and reason for return within 7 business days from receiving your order. If you wish to process the return after 7 business days, then we will only accept the return as a credit for another purchase, subject to 15% of restocking fees. You will receive an insured shipping label (via email) with return instructions 1-2 business days after the request is received. Once you receive the label, the item must be shipped back&nbsp;</span><span className="aBn" data-term="goog_195888561"><span className="aQJ">within 3 days</span></span><span>&nbsp;or the return request will expire.</span></p>
                    <h4 className="return-select-right">Have you received my return?</h4>
                    <p className="return-select-right">We will email you a confirmation once we have processed your return. You can also check on your shipment’s tracking number which is found in the same email as your return label. Please keep your shipment receipt for your record.</p>
                    <h4>Do I have to pay for return shipping?</h4>
                    <p className={styles.contentParagraph}>We provide complimentary shipping and parcel insurance for returns. Please follow the instructions sent with shipping label provided to you by our Concierge team in order to guarantee your items remain insured.</p>
                    <h4 className="return-select-right">How will I be refunded?</h4>
                    <p className="return-select-right">We will refund you via the same method you used to make the purchase. If you prefer, we can also give you store credit.</p>
                    <h4>I have items to return from multiple orders. Can I send them together in the same box?</h4>
                    <p className={styles.contentParagraph}>Yes of course. Please inform us of all items being returned. And make sure your items are in the same condition as received and meet the return eligibility.</p>
                    <h4>I used a coupon or store credit when I originally made my purchase. Will I get this back if I make a return?</h4>
                    <p className={styles.contentParagraph}>All our coupons are for single use only unless otherwise specified. If you return an item that you purchased with a coupon, that coupon will not be valid for use again. However, store credit will be refunded if an item is returned.</p>
                </div>
             
                
                <div id="five" className="faq_group">
                    <div className={styles.sectionHeading}>
                        <h3 className={styles.sectionTitle}>OTHER</h3>
                        <div className={styles.dividerLine}></div>
                    </div>
                    <h4>How does the Headora pre-loved marketplace work?</h4>
                    <p className={styles.contentParagraph}>Headora is an online watch and jewelry marketplace for buyers and sellers. Since we have 1000s of sellers, our items are constantly changing. If you see a product that is no longer available, our concierge team can help source you a similar item. But keep checking back, as new items come on every week and could be unique.</p>
                    <h4>What is the Headora Boutique?</h4>
                    <p className={styles.contentParagraph}>The Headora Boutique is our place to shop directly from brands whereby Headora is an official partner of these brands. As an authorized dealer of the brands, every item in the Headora Boutique comes directly from the brands along with the original Manufacturer's Warranty.</p>
                    <h4>Where is Headora located?</h4>
                    <p className={styles.contentParagraph}>Headora is an online marketplace for buyers and sellers. We are headquartered in New York City and do not currently offer a retail space or showroom.</p>
                    <h4>Where can I send any comments, concerns, or feedback?</h4>
                    <p className={styles.contentParagraph}>We love to hear from our customers as we're passionate about what we do and want to ensure our customers have a great Headora experience. Please send your thoughts to <a href="mailto:support@Headora.com">support@Headora.com</a>.</p>
                    <h4>How do I change my account information (billing, shipping, etc)?</h4>
                    <p className={styles.contentParagraph}>To change any of your account information, just go to your Account page and locate the "Account Settings" tab. Here you can make any necessary changes to your personal information.</p>
                    <h4>I can't log into my account and can't remember my password, what do I do?</h4>
                    <p className={styles.contentParagraph}>You can try resetting your password here. Just click this and it will email you a password reset code. If you don't receive it please check your spam folder. If that doesn't solve it, feel free to contact us at <a href="mailto:support@Headora.com">support@Headora.com</a>.</p>
                    <h4>I just placed an order and I need to cancel it!</h4>
                    <p className={styles.contentParagraph}>Email us at support@Headora.com and we'll process your cancellation request.</p>
                    <h4>Do you have gift cards or certificates?</h4>
                    <p className={styles.contentParagraph}>Unfortunately not at the moment, but we will in the future. Stay tuned!</p>
                </div>

            </div>
                    
        </>
    )
}
export default FaqDiscription