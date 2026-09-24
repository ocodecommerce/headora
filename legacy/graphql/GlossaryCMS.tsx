
const GET_GLOSSARY_PAGE = `
query GetCmsPage {
        cmsPage(identifier: "glossary") {
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
export default GET_GLOSSARY_PAGE