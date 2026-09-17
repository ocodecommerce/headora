const PDPReturnCMSBlock = `
query {
 cmsBlocks(identifiers: "pdp-return-policy") {
    items {
      identifier
      title
      content
    }
  }
}
`;
export default PDPReturnCMSBlock