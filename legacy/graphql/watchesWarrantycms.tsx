
const GET_WATCHES_WARRANTY_PAGE = `
query GetCmsPage {
        cmsPage(identifier: "watch-warranty") {
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
export default GET_WATCHES_WARRANTY_PAGE