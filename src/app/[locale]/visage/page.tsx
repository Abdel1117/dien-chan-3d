import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ParcoursExplorer } from "@/components/ParcoursExplorer";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/visage">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Viewer" });
  return { title: t("title") };
}

export default async function VisagePage({
  params,
}: PageProps<"/[locale]/visage">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main>
      <ParcoursExplorer />
    </main>
  );
}
