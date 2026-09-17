const StockStatus = (urlKey:any ) => `
query {
  products(filter: { url_key: { eq: "${urlKey}" } }) {
    items {
      stock_status
	  }
  }
}

  `
  export default StockStatus