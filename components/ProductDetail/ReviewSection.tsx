
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from '../../styles/ProductDetail.module.css'
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
  const client = new Client()

  useEffect(() => {
    const storedReviewData = localStorage.getItem('reviewSubmitted');
    if (storedReviewData) {
      const { sku, submitted } = JSON.parse(storedReviewData);
      if (submitted && sku === Data.sku) {
        setReviewSubmitted(true);
      } else {
        setReviewSubmitted(false);
      }
    }
  }, [Data?.sku]);

  const handleRatingClick = (categoryId: string, value: number, valueId: string) => {
    setReviewRatings((prevRatings: any) => ({
      ...prevRatings,
      [categoryId]: { value, valueId },
    }));
  };
  const handleReviewButtonClick = () => {
    setIsReviewFormOpen(true);
  };

  const handleRatingSubmit = async () => {
    const SKU = Data.sku;
    const QualityLabel = Object.keys(reviewRatings)[0] || "";
    const QualityValue = reviewRatings[QualityLabel]?.valueId || "";
    const ValueLabel = Object.keys(reviewRatings)[1] || "";
    const ValueValue = reviewRatings[ValueLabel]?.valueId || "";
    const PriceLabel = Object.keys(reviewRatings)[2] || "";
    const PriceValue = reviewRatings[PriceLabel]?.valueId || "";
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
      setIsReviewFormOpen(false)
       // Set the success message
       setSuccessMessage('Thank you for submitting your review! Your review will be displayed soon.');

       // Hide the success message after 5 seconds
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

  const reviews = Data?.reviews?.items || [];
  const overallRating = calculateOverallRating(reviews);

  if (reviews.length === 0) {
    if (reviewSubmitted) {
      return (
        <div className={styles.blankReviewContainer} >
          <div className={styles.ReviewNavbarContainer}>
            <ul className={styles.ReviewNavList}>
              <li className={`${styles.ReviewNavItem} ${styles.ActiveItem}`}>
                REVIEWS
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
  }
  if (reviews.length === 0) {
    return (
      <div className={styles.ReviewContainer}>
        <div className={styles.ReviewNavbarContainer}>
          <ul className={styles.ReviewNavList}>
            <h2 className={`${styles.ReviewNavItem} ${styles.ActiveItem}`}>
              REVIEWS
              <span className={styles.ReviewActiveUnderline}></span>
            </h2>
          </ul>
        </div>
        {!isReviewFormOpen && (
        <div
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
        )}
        {isReviewFormOpen && (
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
            setIsReviewFormOpen={setIsReviewFormOpen}/>
        )}
      </div>
    );
  }

  return (
    <div className={styles.ReviewContainer}>
      <div className={styles.ReviewNavbarContainer}>
        <ul className={styles.ReviewNavList}>
          <li className={`${styles.ReviewNavItem} ${styles.ActiveItem}`}>
            REVIEWS
            <span className={styles.ReviewActiveUnderline}></span>
          </li>
          {reviews.length > 0 && (
            <li className={`${styles.ReviewNavItem}`} style={{ cursor: 'unset' }}>
              <div className={styles.RatingStars}>
                <>
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
                </>
              </div>
            </li>
          )}
        </ul>
      </div>
      <div className={styles.AllReviewsContainer}>
        {Data.reviews.items.map((review: any, index: any) => (
          <>
          <div key={index} className={styles.ReviewCard}>
            <div className={styles.ReviewHeader}>
              <div className={styles.ReviewNickname}>{review.nickname}</div>
              <div className={styles.ReviewRating}>
                <div className={styles.RatingStars}>
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const starValue = (review.average_rating / 20) - idx;
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
          {!isReviewFormOpen && (
          <div className={styles.AddReviewButton}>
            <p>{successMessage}</p>
          <button onClick={handleReviewButtonClick}>Add Your Review</button>
        </div>)}
        {isReviewFormOpen && (
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
        </>
        ))}
         
      </div>
    </div>
  )
}

export default ReviewSection