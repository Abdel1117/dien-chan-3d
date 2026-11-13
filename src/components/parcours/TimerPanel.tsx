"use client";

import { useTranslations } from "next-intl";
import type { ParcoursTimer } from "./hooks/useParcoursTimer";
import { TimerProgress } from "./TimerProgress";
import { clockText, primaryButton, secondaryButton } from "./styles";

/** The timer as a card in the side panel (computer and tablet). */
export function TimerPanel({ timer }: { timer: ParcoursTimer }) {
  const t = useTranslations("Player");
  const { status, active, phase, etape } = timer;

  if (!timer.available) return null;

  return (
    <section
      aria-label={t("title")}
      className="mt-4 hidden rounded-2xl border border-stone-200 bg-stone-50 p-4 lg:block"
    >
      <div aria-live="polite" className="min-h-[4.75rem]">
        {status === "idle" && (
          <p className="text-sm text-stone-600">
            {t("ready", { time: clockText(timer.totalMs) })}
          </p>
        )}
        {status === "done" && <p className="font-medium text-emerald-800">{t("done")}</p>}
        {active && phase && (
          <>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              {t("stepOf", { i: phase.stepIndex + 1, n: timer.stepCount })}
              {timer.tours > 1 && ` · ${t("tourOf", { i: phase.tour, n: timer.tours })}`}
            </p>
            <p className="mt-0.5 truncate font-medium text-stone-900">
              {phase.kind === "pause" || !etape
                ? t("pause")
                : `${etape.point.numero} — ${etape.point.nom}`}
            </p>
            {phase.kind === "step" && phase.side && (
              <p className="mt-1 inline-block rounded-full bg-red-600 px-2.5 py-0.5 text-sm font-medium text-white">
                {t(`side_${phase.side}`)}
              </p>
            )}
          </>
        )}
      </div>

      {active && (
        <p role="timer" className="mt-1 font-mono text-5xl font-semibold tabular-nums text-stone-900">
          {clockText(timer.remainingMs)}
          {timer.counting && (
            <span className="ml-3 text-lg font-normal text-stone-600">
              {t("repsCount", { i: timer.counting.done, n: timer.counting.total })}
            </span>
          )}
        </p>
      )}

      <TimerProgress progress={timer.progress} className="mt-3" />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {status === "idle" && (
          <button type="button" onClick={timer.start} className={primaryButton}>
            {t("start")}
          </button>
        )}
        {status === "running" && (
          <button type="button" onClick={timer.pause} className={primaryButton}>
            {t("pauseButton")}
          </button>
        )}
        {status === "paused" && (
          <button type="button" onClick={timer.resume} className={primaryButton}>
            {t("resume")}
          </button>
        )}
        {active && (
          <button type="button" onClick={timer.previous} className={secondaryButton}>
            {t("previous")}
          </button>
        )}
        {active && (
          <button type="button" onClick={timer.next} className={secondaryButton}>
            {t("next")}
          </button>
        )}
        {status !== "idle" && (
          <button type="button" onClick={timer.reset} className={secondaryButton}>
            {t("restart")}
          </button>
        )}
        <SoundToggle timer={timer} className="ml-auto" />
      </div>
    </section>
  );
}

/** Turns the start and end sounds on or off. */
export function SoundToggle({ timer, className = "" }: { timer: ParcoursTimer; className?: string }) {
  const t = useTranslations("Player");
  return (
    <label className={`flex items-center gap-2 text-sm text-stone-700 ${className}`}>
      <input
        type="checkbox"
        checked={timer.soundOn}
        onChange={(e) => timer.setSoundOn(e.target.checked)}
      />
      {t("sound")}
    </label>
  );
}
