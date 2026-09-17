
const FooterCMS = `
query {
 cmsBlocks(identifiers: "footer") {
    items {
      identifier
      title
      content
    }
  }
}
`;
export default FooterCMS