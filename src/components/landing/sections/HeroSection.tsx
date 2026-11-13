import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroDemo } from "../hero/HeroDemo";
import { primaryButton, wrap } from "../styles";

/** The pitch, next to the real head playing a published routine. */
export function HeroSection() {
  const t = useTranslations("Home");

  return (
    <section className="lg:grid lg:min-h-[min(calc(100dvh-4rem),54rem)] lg:items-center">
      <div
        className={`${wrap} grid items-center gap-10 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-12`}
      >
        <div>
          <p data-enter className="text-sm font-medium uppercase tracking-widest text-teal-700">
            {t("eyebrow")}
          </p>
          <h1
            data-enter-title
            className="mt-4 text-balance font-display text-[2.6rem] font-medium leading-[1.08] tracking-tight text-stone-900 sm:text-6xl"
          >
            {t("title")}
          </h1>
          <p data-enter className="mt-6 max-w-md text-lg leading-relaxed text-stone-600">
            {t("subtitle")}
          </p>
          <div
            data-enter
            className="mt-9 flex flex-col gap-x-7 gap-y-4 sm:flex-row sm:items-center"
          >
            <Link href="/visage" className={primaryButton}>
              {t("cta")}
            </Link>
            <a
              href="#fonctionnement"
              className="link-draw inline-flex min-h-11 items-center self-center pb-0.5 font-medium text-stone-900 sm:self-auto"
            >
              {t("ctaSecondary")}
              <span aria-hidden="true" className="ml-1.5">
                ↓
              </span>
            </a>
          </div>
          <ul
            data-enter
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-stone-200 pt-5 text-sm text-stone-600"
          >
            {([1, 2, 3] as const).map((n) => (
              <li key={n} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-teal-600" />
                {t(`fact${n}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="h-[52vh] min-h-80 overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_50%_38%,#fafaf9_0%,#e7e5e4_78%)] lg:h-[min(72vh,600px)]">
          <HeroDemo />
        </div>
      </div>
    </section>
  );
}
