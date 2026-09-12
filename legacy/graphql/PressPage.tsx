const GET_CMS_PRESS_PAGE = `
query GetCmsPage {
        cmsPage(identifier: "press") {
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
export default GET_CMS_PRESS_PAGE