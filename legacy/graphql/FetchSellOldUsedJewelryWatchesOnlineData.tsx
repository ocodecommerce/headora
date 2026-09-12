const FETCH_SELL_OLD_USED_JEWELRY_WACHES_ONLINE_PAGE = `
query GetCmsPage {
        cmsPage(identifier: "sell-old-used-jewelry-watches-online") {
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
export default FETCH_SELL_OLD_USED_JEWELRY_WACHES_ONLINE_PAGE