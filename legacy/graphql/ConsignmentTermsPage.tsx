const GET_CMS_CONSIGNMENT_TERMS = `
query GetCmsPage {
        cmsPage(identifier: "consignment-page") {
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
export default GET_CMS_CONSIGNMENT_TERMS