export default {
  preset: "minimal", // vertical-agnostic style variant. minimal | bold | classic
  checkout: "native-magento",
  stores: "auto", // auto-discovers Magento store views. locale->store via NEXT_PUBLIC_STORES/LOCALES/CURRENCIES
  locales: ["en"], // must stay array. Add locales only with matching store mapping in .env
  features: { allProductTypes: ["simple", "configurable", "grouped", "bundle", "downloadable", "virtual"], reviewsWrite: "headless" },
};
