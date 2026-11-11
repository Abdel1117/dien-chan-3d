import type { Locale } from "./types";

export const SOURCE_LOCALE: Locale = "fr";

/**
 * Picks the translation for `locale`, falling back to the source language
 * (fr), then to any available one. Returns undefined if there are none.
 */
export function pickTranslation<T extends { locale: Locale }>(
  translations: readonly T[],
  locale: Locale,
): T | undefined {
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === SOURCE_LOCALE) ??
    translations[0]
  );
}
