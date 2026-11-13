"use client";

import { useTranslations } from "next-intl";
import type { ParcoursExplorerState } from "./hooks/useParcoursExplorer";
import type { ParcoursTimer } from "./hooks/useParcoursTimer";
import { StepList } from "./StepList";
import { SoundToggle, TimerPanel } from "./TimerPanel";
import { secondaryButton } from "./styles";

/**
 * What the panel shows once a parcours is open: its presentation, the timer
 * card (computer) or the timer options (phone, where the timer itself sits
 * in the bottom bar), the steps and the warning.
 */
export function SessionPanel({
  explorer,
  timer,
}: {
  explorer: ParcoursExplorerState;
  timer: ParcoursTimer;
}) {
  const t = useTranslations("Explorer");
  const tp = useTranslations("Player");
  const { parcours, etapes } = explorer;

  if (!parcours) return null;

  return (
    <>
      <button
        type="button"
        onClick={explorer.close}
        className="inline-flex min-h-11 items-center text-sm text-stone-600 underline hover:text-stone-900 lg:min-h-0"
      >
        {t("allParcours")}
      </button>
      <h1 className="mt-2 text-lg font-semibold text-stone-900">{parcours.titre}</h1>
      {parcours.description && (
        <p className="mt-1 text-sm text-stone-600">{parcours.description}</p>
      )}
      <p className="mt-2 text-sm text-stone-500">
        {t("stepCount", { n: etapes.length })} · {t("tours", { n: parcours.tours })}
      </p>

      <TimerPanel timer={timer} />

      {timer.available && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-2 lg:hidden">
          <SoundToggle timer={timer} className="min-h-11" />
          {timer.status !== "idle" && (
            <button type="button" onClick={timer.reset} className={secondaryButton}>
              {tp("restart")}
            </button>
          )}
        </div>
      )}

      <StepList etapes={etapes} selected={explorer.selected} onSelect={explorer.select} />

      {parcours.avertissement && (
        <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          <strong>{t("warning")} </strong>
          {parcours.avertissement}
        </p>
      )}
    </>
  );
}
