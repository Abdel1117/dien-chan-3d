import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeadViewerClient } from "@/three/HeadViewerClient";

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
  const t = await getTranslations("Viewer");

  return (
    <main className="relative h-dvh w-full">
      <HeadViewerClient />
      <Link
        href="/"
        className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-stone-800 shadow transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
      >
        {t("back")}
      </Link>
    </main>
  );
}
