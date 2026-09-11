#!/usr/bin/env node
import { writeFileSync } from "fs";
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split("=")));
const env = `MAGENTO_GRAPHQL_URL=${args.url ?? "https://magento.test/graphql"}\nMAGENTO_BASE_URL=${(args.url ?? "https://magento.test/graphql").replace("/graphql", "")}\nNEXT_PUBLIC_STORE=${args.store ?? "default"}\nNEXT_PUBLIC_LOCALE=${args.locale ?? "en"}\nNEXT_PUBLIC_CURRENCY=${args.currency ?? "USD"}\nCHECKOUT_STRATEGY=native-magento\nCOMMERCE_FEATURES=os\nREVALIDATE_SECRET=change-me-16-chars\nHEADORA_PRESET=${args.preset ?? "fashion"}\n`;
writeFileSync(".env", env);
console.log("Wrote .env. Next: npm install && npm run doctor");
