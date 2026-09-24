const GET_RETURNS_PAGE = `
query GetCmsPage {
        cmsPage(identifier: "returns") {
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
export default GET_RETURNS_PAGE