"use client";

import { useTranslations } from "next-intl";

/** Pauses or resumes the preview. */
export function PauseButton({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  const t = useTranslations("Home");

  return (
    <button
      type="button"
      aria-label={paused ? t("demoPlay") : t("demoPause")}
      onClick={onToggle}
      className="grid size-11 place-items-center rounded-full bg-white/90 text-stone-800 shadow transition hover:bg-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        {paused ? (
          <path d="M4 2.5v11l9-5.5z" />
        ) : (
          <path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" />
        )}
      </svg>
    </button>
  );
}
