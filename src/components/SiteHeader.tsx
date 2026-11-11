import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AuthMenu } from "./AuthMenu";
import { MobileNav } from "./MobileNav";
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
        className="relative mx-auto flex max-w-5xl items-center gap-5 px-4 py-3 sm:px-6 sm:py-4"
      >
        <Link
          href="/"
          className="min-w-0 flex-1 truncate font-semibold tracking-tight text-stone-900"
        >
          {t("brand")}
        </Link>
        <MobileNav label={t("menu")}>
          <ul className="flex flex-col gap-3 text-sm text-stone-600 sm:flex-row sm:gap-5">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-stone-900">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="text-sm text-stone-600">
            <Suspense fallback={<span className="inline-block w-16" />}>
              <AuthMenu />
            </Suspense>
          </div>
          <LanguageSwitcher />
        </MobileNav>
      </nav>
    </header>
  );
}
