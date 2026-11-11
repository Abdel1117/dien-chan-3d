"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  advance,
  buildPhases,
  repetitionsDone,
  type Position,
  type Side,
} from "@/lib/minutage/sequence";
import { createBeeper, type Beeper } from "@/lib/minutage/sound";
import type { ParcoursDetail } from "@/lib/supabase/queries";

type Status = "idle" | "running" | "paused" | "done";

const button =
  "rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:opacity-40";
const primary = `${button} bg-stone-900 text-white hover:bg-stone-700`;
const secondary = `${button} border border-stone-300 text-stone-800 hover:bg-stone-100`;

function clockText(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Plays a parcours step by step: countdown (or repetition count), pauses,
 * tours, a sound when a step starts and when it ends.
 */
export function ParcoursPlayer({
  parcours,
  onStep,
}: {
  parcours: ParcoursDetail;
  /** Called with the step being played and, for a two-sided step, the side. */
  onStep: (stepIndex: number, side: Side | null) => void;
}) {
  const t = useTranslations("Player");
  const phases = useMemo(
    () => buildPhases(parcours.etapes, parcours.tours),
    [parcours],
  );
  const totalMs = useMemo(() => phases.reduce((sum, p) => sum + p.ms, 0), [phases]);

  const [status, setStatus] = useState<Status>("idle");
  const [pos, setPos] = useState<Position>({ index: 0, elapsed: 0 });
  const [soundOn, setSoundOn] = useState(true);

  // The timer follows the real clock: `base` ms were already spent in the
  // current phase when it was last (re)started at `startedAt`.
  const clock = useRef({ index: 0, base: 0, startedAt: 0 });
  const beeper = useRef<Beeper | null>(null);
  const soundRef = useRef(true);

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => () => beeper.current?.close(), []);

  const play = useCallback((sound: "stepStart" | "stepEnd" | "finished") => {
    if (soundRef.current) beeper.current?.[sound]();
  }, []);

  /** Jumps to a phase and (re)starts its clock from zero. */
  const enter = useCallback(
    (index: number) => {
      clock.current = { index, base: 0, startedAt: performance.now() };
      setPos({ index, elapsed: 0 });
      const phase = phases[index];
      if (phase?.kind === "step") {
        play("stepStart");
        onStep(phase.stepIndex, phase.side);
      }
    },
    [phases, play, onStep],
  );

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      const c = clock.current;
      const now = performance.now();
      const next = advance(phases, { index: c.index, elapsed: c.base + (now - c.startedAt) });
      if (next.index !== c.index) {
        const previous = phases[c.index];
        clock.current = { index: next.index, base: next.elapsed, startedAt: now };
        const current = phases[next.index];
        if (!current) {
          play("finished");
          setStatus("done");
        } else if (current.kind === "step") {
          // Step followed directly by another step: mark the end, then the start.
          if (previous.kind === "step") play("stepEnd");
          setTimeout(() => play("stepStart"), previous.kind === "step" ? 500 : 0);
          onStep(current.stepIndex, current.side);
        } else {
          play("stepEnd");
        }
      }
      setPos(next);
    }, 100);
    return () => clearInterval(id);
  }, [status, phases, play, onStep]);

  // Keep the screen on during a session (where the browser supports it).
  useEffect(() => {
    if (status !== "running" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = () =>
      navigator.wakeLock
        .request("screen")
        .then((l) => (cancelled ? void l.release() : (lock = l)))
        .catch(() => {});
    const onVisible = () => document.visibilityState === "visible" && acquire();
    void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, [status]);

  if (phases.length === 0) return null;

  function start() {
    beeper.current ??= createBeeper();
    beeper.current.unlock(); // must happen inside the click
    setStatus("running");
    enter(0);
  }
  function pause() {
    clock.current.base += performance.now() - clock.current.startedAt;
    setStatus("paused");
  }
  function resume() {
    beeper.current?.unlock();
    clock.current.startedAt = performance.now();
    setStatus("running");
  }
  function reset() {
    clock.current = { index: 0, base: 0, startedAt: 0 };
    setPos({ index: 0, elapsed: 0 });
    setStatus("idle");
  }
  /**
   * Goes back to the previous step. During a pause that is the step that just
   * ended; on the first step it restarts it.
   */
  function previous() {
    let i = clock.current.index - 1;
    while (i > 0 && phases[i].kind !== "step") i--;
    enter(Math.max(0, i));
  }
  /** Skips to the next step phase (pauses are skipped too). */
  function next() {
    let i = clock.current.index + 1;
    while (i < phases.length && phases[i].kind !== "step") i++;
    if (i >= phases.length) {
      play("finished");
      clock.current.index = phases.length;
      setPos({ index: phases.length, elapsed: 0 });
      setStatus("done");
    } else {
      enter(i);
    }
  }

  const phase = phases[Math.min(pos.index, phases.length - 1)];
  const etape = parcours.etapes[phase.stepIndex];
  const active = status === "running" || status === "paused";
  const before = phases.slice(0, pos.index).reduce((sum, p) => sum + p.ms, 0);
  const progress = status === "done" ? 1 : (before + pos.elapsed) / totalMs;

  return (
    <section aria-label={t("title")} className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div aria-live="polite" className="min-h-[4.75rem]">
        {status === "idle" && <p className="text-sm text-stone-600">{t("ready", { time: clockText(totalMs) })}</p>}
        {status === "done" && <p className="font-medium text-emerald-800">{t("done")}</p>}
        {active && (
          <>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              {t("stepOf", { i: phase.stepIndex + 1, n: parcours.etapes.length })}
              {parcours.tours > 1 && ` · ${t("tourOf", { i: phase.tour, n: parcours.tours })}`}
            </p>
            <p className="mt-0.5 truncate font-medium text-stone-900">
              {phase.kind === "pause"
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
          {clockText(phase.ms - pos.elapsed)}
          {phase.kind === "step" && etape.mode_dosage === "repetitions" && (
            <span className="ml-3 text-lg font-normal text-stone-600">
              {t("repsCount", { i: repetitionsDone(etape, pos.elapsed), n: etape.repetitions ?? 0 })}
            </span>
          )}
        </p>
      )}

      <div
        role="progressbar"
        aria-label={t("progress")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200"
      >
        <div className="h-full bg-stone-900" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {status === "idle" && <button type="button" onClick={start} className={primary}>{t("start")}</button>}
        {status === "running" && <button type="button" onClick={pause} className={primary}>{t("pauseButton")}</button>}
        {status === "paused" && <button type="button" onClick={resume} className={primary}>{t("resume")}</button>}
        {active && <button type="button" onClick={previous} className={secondary}>{t("previous")}</button>}
        {active && <button type="button" onClick={next} className={secondary}>{t("next")}</button>}
        {status !== "idle" && <button type="button" onClick={reset} className={secondary}>{t("restart")}</button>}
        <label className="ml-auto flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={soundOn} onChange={(e) => setSoundOn(e.target.checked)} />
          {t("sound")}
        </label>
      </div>
    </section>
  );
}
