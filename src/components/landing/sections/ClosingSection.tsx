import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { primaryButton, wrap } from "../styles";

/** Closing call to action, with the medical notice. */
export function ClosingSection() {
  const t = useTranslations("Home");

  return (
    <section aria-labelledby="commencer-titre" className="py-20 sm:py-28">
      <div className={`${wrap} text-center`}>
        <h2
          id="commencer-titre"
          className="mx-auto max-w-2xl text-balance font-display text-4xl font-medium tracking-tight text-stone-900 sm:text-6xl"
        >
          {t("closeTitle")}
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-stone-600">{t("closeText")}</p>
        <div className="mt-9">
          <Link href="/visage" className={primaryButton}>
            {t("cta")}
          </Link>
        </div>
        <p
          role="note"
          className="mx-auto mt-14 max-w-xl rounded-2xl bg-stone-100 p-5 text-sm leading-relaxed text-stone-700"
        >
          <strong className="font-semibold text-stone-900">{t("noticeLabel")}</strong>
          {t("notice")}
        </p>
      </div>
    </section>
  );
}
