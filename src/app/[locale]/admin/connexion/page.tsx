import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/LoginForm";
import { SiteHeader } from "@/components/SiteHeader";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/connexion">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Login" });
  return { title: t("metaTitle") };
}

export default async function ConnexionPage({
  params,
}: PageProps<"/[locale]/admin/connexion">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Login");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-stone-600">{t("intro")}</p>
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
          <LoginForm />
        </div>
      </main>
    </>
  );
}
