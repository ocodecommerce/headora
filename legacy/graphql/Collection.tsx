const fetchCollection = (UID: any) => `
query {
  categories(filters:{category_uid:{ eq:"${UID}"}}){
  items{
			uid
  		name
      url_key
    	children{
        name
      	 uid
         url_key
     	children{
        name
       	uid
        image
        url_key
     	children{
        name
       uid
       url_key
}
  }

  }
  }
}
}

`;

export default fetchCollection;



