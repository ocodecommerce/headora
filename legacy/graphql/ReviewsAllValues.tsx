
const ReviewsAllValues = `
query {
  productReviewRatingsMetadata {
    items {
      id
      name
      values {
        value_id
        value
      }
    }
  }
}
  `
export default ReviewsAllValues
