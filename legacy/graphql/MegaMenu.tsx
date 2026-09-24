const fetchMegaMenuQuery = `query {
    megaMenuJson(storeId: 1) {
      success
      message
      items {
        entity_id
        parent_id
        title
        link_type
        link_value
        link_url
        css_class
        level
        position
        is_active
        children {
          entity_id
          parent_id
          title
          link_type
          link_value
          link_url
          css_class
          level
          position
          is_active
          children {
            entity_id
            parent_id
            title
            link_type
            link_value
            link_url
            css_class
            level
            position
            is_active
          }
        }
      }
    }
  }
  `;
export default fetchMegaMenuQuery