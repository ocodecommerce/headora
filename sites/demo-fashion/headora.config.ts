export default {
  preset: "minimal", // vertical-agnostic style variant. minimal | bold | classic
  checkout: "native-magento",
  stores: "auto", // auto-discovers all Magento store views via STORES_QUERY. No per-store code.
  features: { allProductTypes: ["simple", "configurable", "grouped", "bundle", "downloadable", "virtual"], reviewsWrite: "headless" },
  locales: "auto",
};
