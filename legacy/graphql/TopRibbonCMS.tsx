const TopRibbon = `
query {
 cmsBlocks(identifiers: "top-ribbon") {
    items {
      identifier
      title
      content
    }
  }
}
`;
export default TopRibbon