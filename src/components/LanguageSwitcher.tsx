"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_LABELS, routing, type Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <select
      aria-label={t("language")}
      value={locale}
      onChange={(e) =>
        router.replace(pathname, { locale: e.target.value as Locale })
      }
      className="rounded-md border border-stone-300 bg-white px-2 py-1 text-sm text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-stone-900"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>
          {LOCALE_LABELS[l]}
        </option>
      ))}
    </select>
  );
}
