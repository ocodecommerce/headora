const GET_CMS_PRIVACY_POLICY_PAGE = `
query GetCmsPage {
        cmsPage(identifier: "privacy-policy") {
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
export default GET_CMS_PRIVACY_POLICY_PAGE