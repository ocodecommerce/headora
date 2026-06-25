import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '../../styles/ProductDetail.module.css';
import { Client } from '@/graphql/client';
import ReviewForm from './ReviewForm';

function ReviewSection({ Data, AllReviews }: any) {
  const [reviewRatings, setReviewRatings] = useState<{ [key: string]: { value: number; valueId: string } }>({});
  const [reviewNickname, setReviewNickname] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewDetail, setReviewDetail] = useState('');
  const [reviewPostStatus, setReviewPostStatus] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<any>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const client = new Client();


  useEffect(() => {
    const handler = () => isLoggedIn ? setIsReviewFormOpen(true) : null;
  
    window.addEventListener('openReviewForm', handler);
  
    return () => {
      window.removeEventListener('openReviewForm', handler);
    };
  }, []);


  // Check login status from sessionStorage
  useEffect(() => {
    const loadUserStatus = () => {
      const userDataRaw = sessionStorage.getItem('userSyncData');
      if (userDataRaw) {
        try {
          const user = JSON.parse(userDataRaw);
          // More strict check: logged_in must be true AND customer_id should exist
          const logged = user?.logged_in === true && !!user?.customer_id;
          setIsLoggedIn(logged);
        } catch (err) {
          console.warn('Failed to parse userSyncData', err);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    loadUserStatus();

    // Optional: listen for changes (if login/logout happens in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userSyncData') {
        loadUserStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check if user already submitted review for this product
  useEffect(() => {
    const storedReviewData = localStorage.getItem('reviewSubmitted');
    if (storedReviewData) {
      try {
        const { sku, submitted } = JSON.parse(storedReviewData);
        if (submitted && sku === Data.sku) {
          setReviewSubmitted(true);
        } else {
          setReviewSubmitted(false);
        }
      } catch {}
    }
  }, [Data.sku]);

  const handleRatingClick = (categoryId: string, value: number, valueId: string) => {
    setReviewRatings((prevRatings: any) => ({
      ...prevRatings,
      [categoryId]: { value, valueId },
    }));
  };

  const handleReviewButtonClick = () => {
    if (!isLoggedIn) return;
    setIsReviewFormOpen(true);
  };

  const handleRatingSubmit = async () => {
    if (!isLoggedIn) {
      alert('Please log in to submit your review.');
      return;
    }

    const SKU = Data.sku;
    const QualityLabel = Object.keys(reviewRatings)[0] || '';
    const QualityValue = reviewRatings[QualityLabel]?.valueId || '';
    const ValueLabel = Object.keys(reviewRatings)[1] || '';
    const ValueValue = reviewRatings[ValueLabel]?.valueId || '';
    const PriceLabel = Object.keys(reviewRatings)[2] || '';
    const PriceValue = reviewRatings[PriceLabel]?.valueId || '';

    const response = await client.fetchReviewSection(
      SKU,
      reviewNickname,
      reviewTitle,
      reviewDetail,
      QualityLabel,
      QualityValue,
      ValueLabel,
      ValueValue,
      PriceLabel,
      PriceValue
    );

    if (response) {
      setReviewPostStatus(true);
      localStorage.setItem('reviewSubmitted', JSON.stringify({ sku: SKU, submitted: true }));
      setReviewSubmitted(true);
      setIsReviewFormOpen(false);
      setSuccessMessage('Thank you for submitting your review! Your review will be displayed soon.');

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }
  };

  const calculateOverallRating = (reviews: any[]) => {
    if (reviews.length === 0) return 0;
    const totalAverageRating = reviews.reduce(
      (total, review) => total + review.average_rating,
      0
    );
    return totalAverageRating / reviews.length / 20;
  };

  const reviews = Data.reviews?.items || [];
  const overallRating = calculateOverallRating(reviews);

  // ────────────────────────────────────────────────
  // Case 1: No reviews yet + user already submitted
  if (reviews.length === 0 && reviewSubmitted) {
    return (
      <div className={styles.blankReviewContainer}  id="reviews-section" >
        <div className={styles.ReviewNavbarContainer}>
          <ul className={styles.ReviewNavList}>
            <li className={`${styles.ReviewNavItem} ${styles.ActiveItem}`}>
              Reviews
              <span className={styles.ReviewActiveUnderline}></span>
            </li>
          </ul>
        </div>
        <div className={styles.blankReviewContentContainer}>
          <div className={styles.processContainer}>
            <p>Thank you for submitting your review! Your review will be displayed soon.</p>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // Case 2: No reviews yet
  if (reviews.length === 0) {
    return (
      <div className={styles.ReviewContainer}  id="reviews-section" >
        <div className={styles.ReviewNavbarContainer}>
          <ul className={styles.ReviewNavList}>
            <li className={`${styles.ReviewNavItem} ${styles.ActiveItem}`}>
            Reviews
              <span className={styles.ReviewActiveUnderline}></span>
            </li>
          </ul>
        </div>

        {!isReviewFormOpen && (
          <div>
     

            {isLoggedIn ? (  <div
        className={`${styles.ReviewContainContainer} ${
          isReviewFormOpen ? styles.hidden : ""
        }`}
      >
            <div className={styles.ReviewContent}>
              <label>Customer Reviews</label>
              <div className={styles.RatingStars}>
                <Image src="/Images/Filled.png" alt="star" height={12} width={12} />
                <Image src="/Images/Filled.png" alt="star" height={12} width={12} />
                <Image src="/Images/Filled.png" alt="star" height={12} width={12} />
                <Image src="/Images/Filled.png" alt="star" height={12} width={12} />
                <Image src="/Images/Filled.png" alt="star" height={12} width={12} />
              </div>
              <div className={styles.ReviewDescription}>
                <p>We're looking for stars!<br />Let us know what you think</p>
                <button className={styles.reviewButton} onClick={handleReviewButtonClick}>
                  Be the first to write a review!
                </button>
              </div>
            </div>
          </div>
            ):(
              <div className={`${styles.ReviewContainContainer} ${isReviewFormOpen ? styles.hidden : ''}`}>
            <div className={styles.ReviewContent}>


                <div className={styles.reviewLoginAlert}>
                ⚠️ Only registered users can write reviews. Please{" "} 

                  <a href="/customer/account/login">
                    Login Here
                  </a>
                  {" "} or{" "}  
                  <a href="/customer/account/login">
                  create an account
                  </a>


                  </div>   
                  </div>
                </div>)}

    
         
          </div>
        )}

        {isLoggedIn && isReviewFormOpen && (
          <ReviewForm
            AllReviews={AllReviews}
            reviewRatings={reviewRatings}
            handleRatingClick={handleRatingClick}
            setReviewNickname={setReviewNickname}
            reviewNickname={reviewNickname}
            setReviewTitle={setReviewTitle}
            reviewTitle={reviewTitle}
            setReviewDetail={setReviewDetail}
            reviewDetail={reviewDetail}
            handleRatingSubmit={handleRatingSubmit}
            setIsReviewFormOpen={setIsReviewFormOpen}
          />
        )}
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // Case 3: There are existing reviews
  return (
    <div className={styles.ReviewContainer}>
      <div className={styles.ReviewNavbarContainer}>
        <ul className={styles.ReviewNavList}>
          <li className={`${styles.ReviewNavItem} ${styles.ActiveItem}`}>
          Reviews
            <span className={styles.ReviewActiveUnderline}></span>
          </li>
          {reviews.length > 0 && (
            <li className={`${styles.ReviewNavItem}`} style={{ cursor: 'unset' }}>
              <div className={styles.RatingStars}>
                <span className={styles.Overall}> Overall Rating</span>
                {Array.from({ length: 5 }).map((_, idx) => {
                  const starValue = overallRating - idx;
                  if (starValue >= 1) {
                    return (
                      <Image
                        key={idx}
                        src="/Images/Filled.png"
                        alt="Full Star"
                        height={12}
                        width={12}
                      />
                    );
                  } else if (starValue >= 0.5) {
                    return (
                      <Image
                        key={idx}
                        src="/Images/Half filled.png"
                        alt="Half Star"
                        height={12}
                        width={12}
                      />
                    );
                  } else {
                    return (
                      <Image
                        key={idx}
                        src="/Images/Unfilled.png"
                        alt="Empty Star"
                        height={12}
                        width={12}
                      />
                    );
                  }
                })}
              </div>
            </li>
          )}
        </ul>
      </div>

      <div className={styles.AllReviewsContainer}>
        {Data.reviews.items.map((review: any, index: number) => (
          <React.Fragment key={index}>
            <div className={styles.ReviewCard}>
              {/* ... all the review card content remains exactly the same ... */}
              <div className={styles.ReviewHeader}>
                <div className={styles.ReviewNickname}>{review.nickname}</div>
                <div className={styles.ReviewRating}>
                  <div className={styles.RatingStars}>
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const starValue = review.average_rating / 20 - idx;
                      if (starValue >= 1) {
                        return (
                          <Image
                            key={idx}
                            src="/Images/Filled.png"
                            alt="Full Star"
                            height={12}
                            width={12}
                          />
                        );
                      } else if (starValue >= 0.5) {
                        return (
                          <Image
                            key={idx}
                            src="/Images/Half filled.png"
                            alt="Half Star"
                            height={12}
                            width={12}
                          />
                        );
                      } else {
                        return (
                          <Image
                            key={idx}
                            src="/Images/Unfilled.png"
                            alt="Empty Star"
                            height={12}
                            width={12}
                          />
                        );
                      }
                    })}
                  </div>
                </div>
              </div>
              <div className={styles.ReviewSummary}>{review.summary}</div>
              <div className={styles.ReviewDate}>
                {new Date(review.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className={styles.ReviewText}>{review.text}</div>
              <div className={styles.ReviewRatingsBreakdown}>
                {review.ratings_breakdown.map((rating: any, idx: any) => (
                  <div key={idx} className={styles.RatingItem}>
                    <span className={styles.RatingLabel}>{rating.name}: </span>
                    <span className={styles.RatingStars}>
                      {Array.from({ length: 5 }).map((_, starIdx) => {
                        const starValue = parseFloat(rating.value) - starIdx;
                        if (starValue >= 1) {
                          return (
                            <Image
                              key={starIdx}
                              src="/Images/Filled.png"
                              alt="Full Star"
                              height={8}
                              width={8}
                            />
                          );
                        } else if (starValue >= 0.5) {
                          return (
                            <Image
                              key={starIdx}
                              src="/Images/Half filled.png"
                              alt="Half Star"
                              height={8}
                              width={8}
                            />
                          );
                        } else {
                          return (
                            <Image
                              key={starIdx}
                              src="/Images/Unfilled.png"
                              alt="Empty Star"
                              height={8}
                              width={8}
                            />
                          );
                        }
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Keep this — only shows for logged-in users */}
            {isLoggedIn && !isReviewFormOpen && (
              <div className={styles.AddReviewButton}>
                {successMessage && <p>{successMessage}</p>}
                <button onClick={handleReviewButtonClick}>Add Your Review</button>
              </div>
            )}

            {isLoggedIn && isReviewFormOpen && (
              <ReviewForm
                AllReviews={AllReviews}
                reviewRatings={reviewRatings}
                handleRatingClick={handleRatingClick}
                setReviewNickname={setReviewNickname}
                reviewNickname={reviewNickname}
                setReviewTitle={setReviewTitle}
                reviewTitle={reviewTitle}
                setReviewDetail={setReviewDetail}
                reviewDetail={reviewDetail}
                setIsReviewFormOpen={setIsReviewFormOpen}
                handleRatingSubmit={handleRatingSubmit} />
            )}
          </React.Fragment>
        ))}

        {/* ── THIS IS THE NEW/MISSING PART ── */}
        {!isLoggedIn && !isReviewFormOpen && (
          <div className={styles.AddReviewButton}>
            {/* <p>Please log in to write a review</p> */}
            <a href="/customer/account/login" className={styles.reviewButton}>
              Log In to Review
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewSection;