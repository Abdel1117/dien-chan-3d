import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
        <Link
          href="/admin/points"
          className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700"
        >
          {t("points")}
        </Link>
      </main>
    </>
  );
}
