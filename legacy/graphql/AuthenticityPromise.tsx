const AuthenticityPromise = `
query GiveawayPage {
        cmsPage(identifier: "authenticity-promise") {
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
export default AuthenticityPromise