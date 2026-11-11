import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PointEditor } from "@/components/PointEditor";
import { SiteHeader } from "@/components/SiteHeader";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/points">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PointEditor" });
  return { title: t("title") };
}

export default async function PointsPage({
  params,
}: PageProps<"/[locale]/admin/points">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <SiteHeader />
      <PointEditor />
    </>
  );
}
