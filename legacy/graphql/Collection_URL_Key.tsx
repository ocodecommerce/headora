const fetchCollectionByURL = (urlKey: any) => `
query {
  categoryList(filters: { url_path: { eq: "${urlKey}" } }) {
      id
      name
    	uid
  		name
      url_key
      url_path
         meta_title  
          meta_keywords
    meta_description
         image
     
      description
    children {
      name
      uid
      url_key
      url_path
         image
     
      description
    children{
        name
      	 uid
         url_key
         url_path
            image
     
      description
     	children{
        name
       	uid
        image
        url_key
        url_path
     	children{
        name
       uid
       url_key
       url_path
}
  }

  }
    }
  }
}


`;

export default fetchCollectionByURL;