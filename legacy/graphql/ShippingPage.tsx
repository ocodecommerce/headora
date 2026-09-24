const GET_CMS_SHIPPING_PAGE = `
query GetCmsPage {
        cmsPage(identifier: "shipping-1") {
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
export default GET_CMS_SHIPPING_PAGE