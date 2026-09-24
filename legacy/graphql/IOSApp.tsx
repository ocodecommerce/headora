const IOSApp = `
query GiveawayPage {
        cmsPage(identifier: "ios-app") {
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
export default IOSApp