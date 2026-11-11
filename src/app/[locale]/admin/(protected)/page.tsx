import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/SiteHeader";

export default async function AdminHome({
  params,
}: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-stone-600">{t("signedIn")}</p>
      </main>
    </>
  );
}
