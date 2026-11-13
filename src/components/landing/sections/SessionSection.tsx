import { useTranslations } from "next-intl";
import { wrap } from "../styles";

/** The colour code, stated large, then what happens during a session. */
export function SessionSection() {
  const t = useTranslations("Home");

  return (
    <section aria-labelledby="seance-titre" className="bg-stone-900 py-20 text-white sm:py-28">
      <div className={wrap}>
        <h2
          id="seance-titre"
          className="text-sm font-medium uppercase tracking-widest text-stone-400"
        >
          {t("detailsTitle")}
        </h2>
        <p
          data-statement
          className="mt-6 max-w-4xl font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl sm:leading-[1.12]"
        >
          {t.rich("statement", {
            red: (chunks) => <span className="text-red-400">{chunks}</span>,
            amber: (chunks) => <span className="text-amber-400">{chunks}</span>,
          })}
        </p>
        <dl className="mt-14 grid gap-8 border-t border-stone-700 pt-10 sm:mt-20 md:grid-cols-3">
          {([1, 2, 3] as const).map((n) => (
            <div key={n}>
              <dt className="font-semibold">{t(`detail${n}Title`)}</dt>
              <dd className="mt-2 leading-relaxed text-stone-300">{t(`detail${n}Text`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
