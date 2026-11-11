"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

// The 3D scene only runs in the browser.
function Loading() {
  const t = useTranslations("Viewer");
  return (
    <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-500">
      {t("loading")}
    </div>
  );
}

const HeadViewer = dynamic(() => import("./HeadViewer"), {
  ssr: false,
  loading: () => <Loading />,
});

export function HeadViewerClient() {
  return <HeadViewer />;
}
