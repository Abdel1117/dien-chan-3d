"use client";

import { useTranslations } from "next-intl";
import { useCookieNotice } from "@/hooks/useCookieNotice";
import { Link } from "@/i18n/navigation";

/**
 * Tells the visitor which cookies the site uses. It informs and does not ask
 * for consent: the site only sets strictly necessary cookies (session,
 * language). If a tracker is ever added, this must become a real choice.
 */
export function CookieBanner() {
  const t = useTranslations("Cookies");
  const { visible, dismiss } = useCookieNotice();

  if (!visible) return null;

  return (
    <aside
      aria-label={t("label")}
      className="cookie-banner fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-4 shadow-xl shadow-stone-900/10 sm:inset-x-6 sm:bottom-6 sm:flex sm:items-center sm:gap-5 sm:p-5"
    >
      <p className="text-sm leading-relaxed text-stone-700">
        {t("text")}{" "}
        <Link
          href="/confidentialite"
          className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600"
        >
          {t("more")}
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="mt-3 inline-flex min-h-11 w-full flex-none items-center justify-center rounded-full bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-700 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 sm:mt-0 sm:w-auto"
      >
        {t("accept")}
      </button>
    </aside>
  );
}
