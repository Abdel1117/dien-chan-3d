"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  advance,
  buildPhases,
  repetitionsDone,
  type Position,
  type Side,
} from "@/lib/minutage/sequence";
import { createBeeper, type Beeper } from "@/lib/minutage/sound";
import type { ParcoursDetail } from "@/lib/supabase/queries";
import { useWakeLock } from "./useWakeLock";

export type TimerStatus = "idle" | "running" | "paused" | "done";

const START: Position = { index: 0, elapsed: 0 };

/**
 * Plays a parcours step by step: countdown (or repetition count), pauses,
 * tours, a sound when a step starts and when it ends, screen kept on.
 * It starts over by itself when another parcours is given. The components
 * using it only display what it returns.
 */
export function useParcoursTimer(
  parcours: ParcoursDetail | null,
  /** Called with the step being played and, for a two-sided step, the side. */
  onStep: (stepIndex: number, side: Side | null) => void,
) {
  const phases = useMemo(
    () => (parcours ? buildPhases(parcours.etapes, parcours.tours) : []),
    [parcours],
  );
  const totalMs = useMemo(() => phases.reduce((sum, p) => sum + p.ms, 0), [phases]);

  const parcoursId = parcours?.id ?? null;
  const [state, setState] = useState({
    parcoursId,
    status: "idle" as TimerStatus,
    pos: START,
  });
  // Another parcours was opened: start over (state adjusted while rendering).
  if (state.parcoursId !== parcoursId) {
    setState({ parcoursId, status: "idle", pos: START });
  }
  const { status, pos } = state;
  const setStatus = (next: TimerStatus) => setState((s) => ({ ...s, status: next }));
  const setPos = (next: Position) => setState((s) => ({ ...s, pos: next }));

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
      setState((s) => ({ ...s, pos: { index, elapsed: 0 } }));
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
      let finished = false;
      if (next.index !== c.index) {
        const previous = phases[c.index];
        clock.current = { index: next.index, base: next.elapsed, startedAt: now };
        const current = phases[next.index];
        if (!current) {
          play("finished");
          finished = true;
        } else if (current.kind === "step") {
          // Step followed directly by another step: mark the end, then the start.
          if (previous.kind === "step") play("stepEnd");
          setTimeout(() => play("stepStart"), previous.kind === "step" ? 500 : 0);
          onStep(current.stepIndex, current.side);
        } else {
          play("stepEnd");
        }
      }
      setState((s) => ({ ...s, pos: next, status: finished ? "done" : s.status }));
    }, 100);
    return () => clearInterval(id);
  }, [status, phases, play, onStep]);

  useWakeLock(status === "running");

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
    setState((s) => ({ ...s, status: "idle", pos: START }));
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

  // What is being played right now (the last phase once the parcours is done).
  const phase = phases[Math.min(pos.index, phases.length - 1)];
  const etape = phase && parcours ? parcours.etapes[phase.stepIndex] : undefined;
  const before = phases.slice(0, pos.index).reduce((sum, p) => sum + p.ms, 0);
  const counting =
    phase?.kind === "step" && etape?.mode_dosage === "repetitions"
      ? { done: repetitionsDone(etape, pos.elapsed), total: etape.repetitions ?? 0 }
      : null;

  return {
    /** False when the parcours has nothing to play (no step with a duration). */
    available: phases.length > 0,
    status,
    /** The timer is running or paused: there is a current step to show. */
    active: status === "running" || status === "paused",
    phase,
    etape,
    stepCount: parcours?.etapes.length ?? 0,
    tours: parcours?.tours ?? 1,
    totalMs,
    remainingMs: phase ? phase.ms - pos.elapsed : 0,
    /** Share of the whole parcours already played, from 0 to 1. */
    progress: status === "done" ? 1 : totalMs > 0 ? (before + pos.elapsed) / totalMs : 0,
    /** Presses done and expected, for a step counted in repetitions. */
    counting,
    soundOn,
    setSoundOn,
    start,
    pause,
    resume,
    reset,
    previous,
    next,
  };
}

export type ParcoursTimer = ReturnType<typeof useParcoursTimer>;
