const BitPayTerms = `
query GiveawayPage {
        cmsPage(identifier: "bitpay-terms") {
            url_key
            content
            content_heading
            title
            page_layout
            meta_title
            meta_keywords
            meta_description
        }
    }
`;
export default BitPayTerms