import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocument } from "@/components/legal/LegalDocument";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/mentions-legales">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal" });
  return { title: t("title"), description: t("description") };
}

export default async function LegalNoticePage({
  params,
}: PageProps<"/[locale]/mentions-legales">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalDocument namespace="Legal" />;
}
