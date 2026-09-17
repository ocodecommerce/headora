const GET_CMS_PAGE = (identifier: any)=> `
query GetCmsPage {
        cmsPage(identifier: "${identifier}") {
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
export default GET_CMS_PAGE