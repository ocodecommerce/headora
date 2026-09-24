const NOT_FOUND_PAGE_CSM = `
query GetCmsPage {
        cmsPage(identifier: "boutique-not-found") {
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
export default NOT_FOUND_PAGE_CSM