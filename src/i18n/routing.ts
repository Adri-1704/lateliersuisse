import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "de", "en", "pt", "es"],
  defaultLocale: "fr",
  localePrefix: "always",
});
