import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AuthMenu } from "./AuthMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function SiteHeader() {
  const t = useTranslations("Header");
  const links = [
    { href: "/", label: t("home") },
    { href: "/visage", label: t("face") },
  ] as const;

  return (
    <header className="border-b border-stone-200 bg-white">
      <nav
        aria-label={t("nav")}
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4"
      >
        <Link href="/" className="font-semibold tracking-tight text-stone-900">
          {t("brand")}
        </Link>
        <div className="flex items-center gap-5">
          <ul className="flex gap-5 text-sm text-stone-600">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-stone-900">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="text-sm text-stone-600">
            <Suspense fallback={<span className="inline-block w-20" />}>
              <AuthMenu />
            </Suspense>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
