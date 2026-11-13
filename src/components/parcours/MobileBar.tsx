"use client";

import { useTranslations } from "next-intl";
import type { ParcoursExplorerState } from "./hooks/useParcoursExplorer";
import type { ParcoursTimer } from "./hooks/useParcoursTimer";
import { TimerProgress } from "./TimerProgress";
import { clockText } from "./styles";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900";
const big = `inline-flex min-h-12 items-center justify-center rounded-full px-4 font-medium active:scale-[0.97] ${focus}`;
const bigPrimary = `${big} bg-stone-900 text-white`;
const bigSecondary = `${big} border border-stone-300 text-stone-800`;

/** Opens or closes the panel (parcours list, or steps of the session). */
function PanelToggle({ explorer }: { explorer: ParcoursExplorerState }) {
  const t = useTranslations("Explorer");
  const { panelOpen } = explorer;
  return (
    <button
      type="button"
      aria-expanded={panelOpen}
      aria-controls="explorer-panel"
      onClick={explorer.togglePanel}
      className={`-mr-2 inline-flex min-h-11 flex-none items-center gap-1.5 rounded-full px-3 text-sm font-medium text-stone-800 ${focus}`}
    >
      {explorer.parcours ? t("steps") : t("title")}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`transition-transform duration-300 ${panelOpen ? "rotate-180" : ""}`}
      >
        <path d="M3 9l4-4 4 4" />
      </svg>
    </button>
  );
}

/**
 * Phone only: the session at the bottom of the screen, always in view. A
 * large countdown, the current point, and the three controls under the thumb.
 */
export function MobileBar({
  explorer,
  timer,
}: {
  explorer: ParcoursExplorerState;
  timer: ParcoursTimer;
}) {
  const t = useTranslations("Player");
  const te = useTranslations("Explorer");
  const { parcours } = explorer;
  const { status, active, phase, etape } = timer;

  return (
    <section
      aria-label={parcours ? t("title") : te("title")}
      className="relative z-30 flex-none border-t border-stone-200 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 lg:hidden"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm text-stone-600">
          {!parcours && te("title")}
          {parcours && !active && parcours.titre}
          {active && phase && (
            <>
              {t("stepOf", { i: phase.stepIndex + 1, n: timer.stepCount })}
              {timer.tours > 1 && ` · ${t("tourOf", { i: phase.tour, n: timer.tours })}`}
            </>
          )}
        </p>
        <PanelToggle explorer={explorer} />
      </div>

      {parcours && timer.available && (
        <div aria-live="polite">
          {status === "idle" && (
            <>
              <p className="text-sm text-stone-600">
                {t("ready", { time: clockText(timer.totalMs) })}
              </p>
              <button type="button" onClick={timer.start} className={`${bigPrimary} mt-3 w-full`}>
                {t("start")}
              </button>
            </>
          )}

          {status === "done" && (
            <>
              <p className="font-medium text-emerald-800">{t("done")}</p>
              <button type="button" onClick={timer.reset} className={`${bigPrimary} mt-3 w-full`}>
                {t("restart")}
              </button>
            </>
          )}

          {active && phase && (
            <>
              <div className="flex items-center gap-4">
                <p
                  role="timer"
                  className="flex-none font-mono text-6xl font-semibold leading-none tabular-nums text-stone-900"
                >
                  {clockText(timer.remainingMs)}
                </p>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-medium leading-snug text-stone-900">
                    {phase.kind === "pause" || !etape
                      ? t("pause")
                      : `${etape.point.numero} — ${etape.point.nom}`}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-600">
                    {phase.kind === "step" && phase.side && (
                      <span className="rounded-full bg-red-600 px-2.5 py-0.5 font-medium text-white">
                        {t(`side_${phase.side}`)}
                      </span>
                    )}
                    {timer.counting &&
                      t("repsCount", { i: timer.counting.done, n: timer.counting.total })}
                  </p>
                </div>
              </div>

              <TimerProgress progress={timer.progress} className="mt-3" />

              <div className="mt-3 grid grid-cols-[1fr_1.4fr_1fr] gap-2">
                <button type="button" onClick={timer.previous} className={bigSecondary}>
                  {t("previous")}
                </button>
                {status === "running" ? (
                  <button type="button" onClick={timer.pause} className={bigPrimary}>
                    {t("pauseButton")}
                  </button>
                ) : (
                  <button type="button" onClick={timer.resume} className={bigPrimary}>
                    {t("resume")}
                  </button>
                )}
                <button type="button" onClick={timer.next} className={bigSecondary}>
                  {t("next")}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
