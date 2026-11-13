import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const LINKS = [
  { href: "/mentions-legales", labelKey: "legal" },
  { href: "/confidentialite", labelKey: "privacy" },
] as const;

/** Brand, legal links and the credit line of the 3D model (CC BY). */
export function SiteFooter() {
  const t = useTranslations("Footer");
  const th = useTranslations("Header");
  const tv = useTranslations("Viewer");

  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 text-xs text-stone-500 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-stone-700">{th("brand")}</p>
          <nav aria-label={t("nav")}>
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {LINKS.map(({ href, labelKey }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="link-draw inline-flex min-h-11 items-center text-stone-700 sm:min-h-0"
                  >
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-4 max-w-2xl">{tv("credit")}</p>
      </div>
    </footer>
  );
}
