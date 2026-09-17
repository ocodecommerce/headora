import { useEffect, useState } from "react";
import styles from "../../styles/ProductDetail.module.css";
import Image from "next/image";
import Link from "next/link";


const Data = [
  {
    "customer": "AnneMarie",
    "score": 5,
    "review": "This site offers excellent Designer signed jewelry pieces, and other fine jewelry, at affordable prices. They offer both new, and pre owned jewelry at a reasonable cost. Most importantly, they have excellent customer service. They aim to please & to give their customers the best consumer experience. I have purchased several items from True Facet, including David Yurman, & Tiffany. I have always been happy with the item I received. It is always authentic, \" the real deal\", professionally cleaned & polished, & looks brand new! You can't go wrong purchasing from this site. Give them a try. You won't be sorry! Free shipping too!!"
  },
  {
    "customer": "William",
    "score": 5,
    "review": "I recently bought a Tiffany&Co diamond wedding band for my fiancé through Headora. We both had some pretty major reservations about the purchase; it was a lot of money to spend and on a brand name, not just not from the brand itself but from a website neither of us had ever heard of. But the great deal and the return policy gave us the confidence to pull the trigger, and we couldn't be happier! The band arrived in just two days and the diamonds were beyond sparkly (certainly an exciting package to open!). We immediately took the band to our jeweler to have everything verified and appraised and, to our delight, the diamonds measured twice as big as what had been listed! We also brought the band to Tiffany to have it double checked there, and everything is legit! We had such a positive experience with Headora, I would definitely consider purchasing from them again and would absolutely recommend them to anyone!"
  },
  {
    "customer": "AW",
    "score": 5,
    "review": "I love ordering jewelry from Headora! Super reliable, fast, and to top it off they have beautiful products! Would absolutely buy from them again and again!"
  },
  {
    "customer": "Renee",
    "score": 5,
    "review": "True Facet's customer service is truly exceptional. Their customer service specialists responded to my email inquiries promptly, and satisfactorily resolved my issues very quickly. Additionally, the quality of the jewelry that I purchased from them exceeded my expectations and looked virtually new. They will be my first stop for any online jewelry purchases."
  },
  {
    "customer": "John",
    "score": 5,
    "review": "Headora is a reliable authenticator and valuator of watches assisting buyers and sellers. My experience is they are sincere and have excellent customer service representatives."
  },
  {
    "customer": "Christopher",
    "score": 5,
    "review": "I will use these guys AGAIN! Great customer service with same day answers to all of my questions. Pricing was extremely competitive and my watch shipped, and was to me even during holiday season in less than a week. Most certainly recommend these folks! THE BEST!"
  },
  {
    "customer": "Jason",
    "score": 5,
    "review": "Rachel at Headora worked very hard for many months to find a watch that I wanted to acquire. I had a number of companies working to locate this piece, and Headora was the only company that was able to make it happen. I would highly recommend Rachel and the entire team at Headora."
  },
  {
    "customer": "Dawn",
    "score": 5,
    "review": "I have completed several transactions so far and all have been awesome. The jewelry is as described and the customer service is first rate. There is no reason for you to buy at retail prices ever again!"
  },
  {
    "customer": "William",
    "score": 5,
    "review": "Received watch in 1 day..looked like never used..also surprised to receive extra first time purchase $50 discount. The customer service is fantastic. By far the best online company that I have ever used. You deserve 10 stars.."
  },
  {
    "customer": "Doug",
    "score": 5,
    "review": "One of the best online retailers with whom I have dealt. When I placed my order, I made an error about delivery. Contacted them by way of email and they had a response back to me within two hours. Then I had another question and once again I received an answer back within 2 hours. And that was on a weekend. The product arrived on time and was in wonderful condition. I will definitely deal with this company again."
  },
  {
    "customer": "JP",
    "score": 5,
    "review": "I recently purchased a watch from Headora, and of course, like most people - made a last minute decision to purchase a week before I wanted to wear the watch at a special occasion (my friends wedding). I wrote an email to True Facet after purchasing the watch, and within 10 minutes on a Sunday night, their customer service manager emailed back. Through the week, I maintained contact with the manager and one other team manager, and they lived up to their promise! They made sure the watch would pass their verification process (which is normally upwards of five days already) and made sure to ship it to arrive all within an acceptable time frame. Not only did I receive a great looking luxury watch in time for the wedding (which by the way, looked exactly like those in the pictures), but they really took care of my delivery request and left me feeling like a special client. The price of the watch was by far not at the top of their list, yet I was treated as if I were buying their $200,000 Patek Phillipe. Great business model, and overall excellent staff. Due to the care I received, I would gladly recommend this company without a doubt to any of my watch wearing friends!"
  },
  {
    "customer": "Erwin",
    "score": 5,
    "review": "I was looking for a cartier love bracelet and I happened to come across TF online. A little hesitant in the beginning but went ahead and proceeded with the purchase. No regrets!! My online buying experience was excellent. Rachel (thank you) in customer concierge was so wonderful helping me with the process from beginning to end and she made the whole buying experience less stressful. All my concerns and questions were addressed immediately. An extra mile was taken when I needed to find the right size. The package was timely and delivered as advertised and most especially, authentic. I will definitely recommend TF to my friends for their quality fine jewelry and wonderful customer service."
  },
  {
    "customer": "Rhonda",
    "score": 5,
    "review": "Headora carries a great selection of quality fine jewelry. I have ordered from Trufacet several times since I became a fan in the summer of 2015. Also, the staff is very friendly, helpful and professional. I don't recall how I found Headora, but I'm glad I did. They carry pieces that I haven't seen before, and won't find anywhere else. I consider buying with Headora an investment, because the designer pieces Headora carries will always be valuable, and at the same time I'm getting a great price!"
  },
  {
    "customer": "Albert",
    "score": 5,
    "review": "As an avid watch collector, I'm still a little hesitant to purchase timepieces online, especially when the cost is in the thousands of dollars. That's why I was a little reluctant about the Jaeger LeCoultre listed on True Facet, having never seen the actual watch in person. However, Rachel, who helped me, was very knowledgeable, responsive and friendly, answering any and all questions I had. She explained True Facet's return policy, how certain watches are sourced, including True Facet's guaranty of authenticity. And when I had concerns about shipping time, Tirath, the CEO, was quick to assist and address any potential issues. Most importantly, I never felt any pressure to buy. So with everything in mind, I decided to take a chance on my first watch from True Facet, a Jaeger LeCoultre Master Calendar - the older model with the power reserve at 12. I had been eyeing this model for quite some time, and as seldom as the watch gets listed for sale, the price offered at True Facet was simply unbeatable. That's why I was even more amazed when I received the watch. It was listed as \"preowned excellent\" but it was truly MINT. Along with genuine box and papers (stamped by an authorized dealer), I couldn't be more happy with my purchase. And everything else - from the careful packaging, beautiful card stock, and True Facet valuation report - was truly top-shelf. I'll definitely consider True Facet for my future timepiece purchases... great service, rare finds, and incredible prices!"
  },
  {
    "customer": "Paul",
    "score": 5,
    "review": "Did a lot of research about purchasing a pre-owned time piece and was concerned about quality, authenticity and service. True Facet took all those worries out if the equation!! I purchased a Breitling watch from them and it is exquisite! Slight problem with a function push button upon arrival so I contacted the True Facet concierge team and they went above and beyond to get the watch serviced and issue corrected. They kept me informed every step of the way and got the watch back to me in perfect functioning condition and an out of the box new look!! All my future time piece purchases will be made with True Facet."
  },
  {
    "customer": "Chris",
    "score": 5,
    "review": "I ordered a Hublot watch from them. I had an issue with my purchase which they went above-and-beyond to resolve for me. I've never done business with a company that worked so hard to resolve an issue for me. I was willing to live with it, but they insisted they take care of it. Their communication throughout the process was exceptional and I can't thank Rachel enough for everything she did to support me. I'm thrilled with my purchase and my decision to buy from Headora. I will be buying from them again."
  },
  {
    "customer": "Julie",
    "score": 5,
    "review": "My experience with Headora was great. I originally picked out a watch that was sent to me very quickly. When I got the watch, it was in excellent condition and looked brand new, but it turned out not to be exactly what I was looking for. The members of the Headora team were available immediately to help me find what I had in mind. They made the return process incredibly simple. They found me a perfect watch, and it came within days! It is absolutely perfect!! Outstanding customer service, will use this site again!"
  },
  {
    "customer": "Sheila",
    "score": 5,
    "review": "I was assisted by Rachel and Ian during the purchase process. They helped me find the perfect watch for my husband! They also were quick to respond whenever I had a question. I can't thank them enough. Wonderful company, fabulous staff!"
  },
  {
    "customer": "Tara",
    "score": 5,
    "review": "I desperately wanted a Cartier Stella ring for one of my Wedding Bands. However, the company no longer makes them. I was hesitant to order \"second hand\" or online - but I tried a few different sites and True Facet exceeded all of my expectations. The ring is essentially brand new. I tried other \"resale\" companies who offered the same product for a slightly lower rate - what a mistake! After receiving my ring from True Facet -- I may never buy jewelry retail again!!!"
  },
  {
    "customer": "Nicole",
    "score": 5,
    "review": "I have sold several pieces of jewelry on the True Facet Website and have had a great experience dealing with them. They help you list, price and sell your items very quickly. I have been thrilled with how easy listing my items with them was. Consigning online was extremely hassle free and allowed me to reach a much bigger audience then trying to sell on my own. I would definitely list with them again and look forward to purchasing items on their site as well. I feel much better about purchasing with them, where items are authenticated, and you know you are getting what you paid for."
  }
]
function StaticReview() {
  const [selectedReviews, setSelectedReviews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const shuffled = [...Data].sort(() => 0.5 - Math.random());
    setSelectedReviews(shuffled.slice(0, 3));
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % selectedReviews.length);
    setShowMore(false); // reset read more state
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + selectedReviews.length) % selectedReviews.length);
    setShowMore(false); // reset read more state
  };

  const getTrimmedReview = (review: string) => {
    const words = review.split(" ");
    return words.slice(0, 30).join(" ") + "...";
  };

  return (
    <div className={styles.StaticSliderWrapper}>
      <h3 className={styles.StaticTitle}>WHAT OUR CUSTOMERS SAY</h3>
      <div className={styles.StaticSlider}>
        <div className={styles.trustPilotImage}>
        <Link href="https://www.trustpilot.com/review/Headora.com" target="_blank" rel="nofollow noopener noreferrer noindex">
          <Image src={"/Images/trustpilot.png"} height={40} width={200} alt="trustpilot" />
          </Link>
        </div>

        {selectedReviews.length > 0 && (
          <>
            <div className={styles.StaticStars}>
              <div className={styles.StaticReviewCount}>{selectedReviews[currentIndex].score}/5</div>
              <div className={styles.StaticReviewsWrapper}>
                <span>{"★".repeat(selectedReviews[currentIndex].score)}</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className={styles.staticButtonWrapper}>
              <button className={styles.StaticArrow} onClick={handlePrev}>
              
                <Image src="/Images/leftGoldenArrow.png" alt="Left Arrow" width={20} height={30} />
              </button>

              <div className={styles.StaticReviewCard}>
                <p className={styles.StaticReview}>
                  {showMore
                    ? selectedReviews[currentIndex].review
                    : getTrimmedReview(selectedReviews[currentIndex].review)}
                    {' '}
                      <span
                  onClick={() => setShowMore((prev) => !prev)}
                  className={styles.ReadMoreButton}
                >

                  {showMore ? "Show Less" : "Read More"}
                </span>
                </p>
              
                <p className={styles.StaticCustomer}>- {selectedReviews[currentIndex].customer}</p>
              </div>

              <button className={styles.StaticArrow} onClick={handleNext}>
                <Image src="/Images/rightGoldenArrow.png" alt="arrow" width={10} height={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StaticReview;