"use client";

import { useTranslations } from "next-intl";

/** How far the whole parcours has been played, as a thin bar. */
export function TimerProgress({ progress, className = "" }: { progress: number; className?: string }) {
  const t = useTranslations("Player");
  return (
    <div
      role="progressbar"
      aria-label={t("progress")}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className={`h-1.5 overflow-hidden rounded-full bg-stone-200 ${className}`}
    >
      <div className="h-full bg-stone-900" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}
