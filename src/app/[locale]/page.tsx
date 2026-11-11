import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/SiteHeader";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("Home");
  const features = [1, 2, 3] as const;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6">
        <section className="py-20 text-center sm:py-28">
          <p className="text-sm font-medium uppercase tracking-widest text-stone-500">
            {t("eyebrow")}
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-stone-600">
            {t("subtitle")}
          </p>
          <div className="mt-10">
            <Link
              href="/visage"
              className="inline-block rounded-full bg-stone-900 px-6 py-3 font-medium text-white transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              {t("cta")}
            </Link>
          </div>
        </section>

        <section aria-labelledby="fonctionnement" className="pb-16">
          <h2 id="fonctionnement" className="sr-only">
            {t("featuresTitle")}
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3">
            {features.map((n) => (
              <li
                key={n}
                className="rounded-2xl border border-stone-200 bg-white p-6"
              >
                <h3 className="font-semibold text-stone-900">
                  {t(`feature${n}Title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {t(`feature${n}Text`)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <aside
          role="note"
          className="mb-20 rounded-2xl bg-stone-100 p-6 text-sm leading-relaxed text-stone-700"
        >
          <strong className="font-semibold text-stone-900">
            {t("noticeLabel")}
          </strong>
          {t("notice")}
        </aside>
      </main>
    </>
  );
}
