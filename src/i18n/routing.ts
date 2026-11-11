import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "vi"],
  defaultLocale: "fr",
});

export type Locale = (typeof routing.locales)[number];

/** Native names shown in the language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  vi: "Tiếng Việt",
};
