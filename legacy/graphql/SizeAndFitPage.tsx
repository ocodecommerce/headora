const GET_CMS_SIZE_AND_FIT_PAGE = `

query GetCmsPage {
        cmsPage(identifier: "how-to-check-size-and-fit") {
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
export default GET_CMS_SIZE_AND_FIT_PAGE