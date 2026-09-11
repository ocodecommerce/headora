import React, { useState } from 'react'
import styles from '../../styles/ProductDetail.module.css'
import Image from 'next/image'

function ReviewForm({AllReviews, reviewRatings, handleRatingClick, setReviewNickname, reviewNickname, setReviewTitle, reviewTitle, setReviewDetail, reviewDetail,handleRatingSubmit,setIsReviewFormOpen}:any) {
    const [isClosing, setIsClosing] = useState<any>(false);
    const closeReview = () => {
        setIsClosing(true);
        setTimeout(() => {
          setIsReviewFormOpen(false);
          setIsClosing(false);
        }, 300); // Match this duration with your CSS animation time
      };
    return (
        <>
            <div className={`${styles.review_form} ${isClosing ? 'hidden' : ''}`} id="review-form">
                <div className={styles.ReviewHeadingWrapper}>
                <h4>Submit Your Opinion</h4>
                <span onClick={closeReview}>-</span>
                </div>
                <div className={styles.star_field}>
                    {AllReviews.productReviewRatingsMetadata.items.map((category: any) => (
                        <div key={category.id} className={styles.field}>
                            <label className={styles.label}>{category.name}</label>
                            <div className={styles.starrating}>
                                {category.values.map((value: any, index: any) => (
                                    <Image
                                        key={value.value_id}
                                        onClick={() => handleRatingClick(category.id, index + 1, value.value_id)}
                                        src={
                                            reviewRatings[category.id]?.value >= index + 1
                                                ? "/Images/Filled.png"
                                                : "/Images/Unfilled.png"
                                        }
                                        width={20}
                                        height={20}
                                        alt={`${value.value} star`}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.field_wrapper}>
                <div className={styles.field} style={{flex:'1 2'}}>
                    <label className={styles.label}>Name</label>
                    <div className={styles.control}>
                        <input
                            onChange={(e) => setReviewNickname(e.target.value)}
                            value={reviewNickname}
                            type="text"
                            name="nickname"
                            className={styles.input_text}
                        />
                    </div>
                </div>
                <div className={styles.field} style={{flex:'2 2'}}>
                    <label className={styles.label}>Heading</label>
                    <div className={styles.control}>
                        <input
                            onChange={(e) => setReviewTitle(e.target.value)}
                            value={reviewTitle}
                            type="text"
                            name="title"
                            className={styles.input_text}
                        />
                    </div>
                </div>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Your Review</label>
                    <div className={styles.control}>
                        <textarea
                            onChange={(e) => setReviewDetail(e.target.value)}
                            value={reviewDetail}
                            className={styles.input_text_area}
                        />
                    </div>
                </div>
                <div className={styles.field}>
                    <div className={styles.fieldAction}>
                        <button
                            type="submit"
                            className={styles.action_submit}
                            onClick={handleRatingSubmit}
                            // disabled={!reviewNickname || !reviewTitle || !reviewDetail || Object.keys(reviewRatings).length === 0}
                        >
                            Submit Your Opinion
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
export default ReviewForm
