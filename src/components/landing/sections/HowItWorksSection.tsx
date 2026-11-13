import { useTranslations } from "next-intl";
import { wrap } from "../styles";
import { StepsVisual } from "../visuals/StepsVisual";
import { TimerVisual } from "../visuals/TimerVisual";
import { ViewsVisual } from "../visuals/ViewsVisual";

const VISUALS = [ViewsVisual, StepsVisual, TimerVisual] as const;

/** Three steps of a session, each with a small preview of the app. */
export function HowItWorksSection() {
  const t = useTranslations("Home");

  return (
    <section
      id="fonctionnement"
      aria-labelledby="fonctionnement-titre"
      className="scroll-mt-6 border-t border-stone-200 bg-white py-20 sm:py-28"
    >
      <div className={wrap}>
        <h2
          id="fonctionnement-titre"
          className="max-w-xl font-display text-3xl font-medium tracking-tight text-stone-900 sm:text-5xl"
        >
          {t("featuresTitle")}
        </h2>
        <ol className="mt-12 grid gap-10 sm:mt-16 md:grid-cols-3 md:gap-8">
          {VISUALS.map((Visual, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            return (
              <li key={n}>
                <Visual />
                <p className="mt-6 font-mono text-sm text-teal-700">0{n}</p>
                <h3 className="mt-1 text-xl font-semibold text-stone-900">
                  {t(`feature${n}Title`)}
                </h3>
                <p className="mt-2 leading-relaxed text-stone-600">{t(`feature${n}Text`)}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
