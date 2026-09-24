const GET_CMS_TERMS_OF_SERVICE_PAGE = `
query GetCmsPage {
        cmsPage(identifier: "terms-of-service") {
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
export default GET_CMS_TERMS_OF_SERVICE_PAGE