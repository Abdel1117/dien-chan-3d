"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { Locale } from "@/i18n/routing";
import { toDemoPoints } from "../hero/demoPoints";
import { useDemoParcours } from "./useDemoParcours";

/**
 * State of the home page preview: which step of the demo parcours is being
 * played, whether the head is drawn, and whether the visitor paused it.
 * The components using it only render what it returns.
 */
export function useDemoPlayer() {
  const locale = useLocale() as Locale;
  const reduced = usePrefersReducedMotion();
  const parcours = useDemoParcours(locale);

  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false); // the head model is drawn
  const [paused, setPaused] = useState(false);

  const etapes = useMemo(() => parcours?.etapes ?? [], [parcours]);
  const count = etapes.length;
  const step = etapes[index];
  const nextId = count > 1 ? etapes[(index + 1) % count]?.id : undefined;
  const points = useMemo(() => toDemoPoints(etapes, nextId), [etapes, nextId]);

  const markReady = useCallback(() => setReady(true), []);
  const nextStep = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const togglePause = useCallback(() => setPaused((v) => !v), []);

  return {
    /** The step being played, or undefined without data. */
    step,
    index,
    count,
    /** Markers for the 3D head. */
    points,
    /** The head model is loaded and drawn. */
    ready,
    paused,
    /** The visitor asked their system for less motion. */
    reduced,
    /** The head and its markers move (not paused, motion allowed). */
    animated: !reduced && !paused,
    /** The step timer runs. */
    playing: ready && !reduced && !paused,
    markReady,
    nextStep,
    togglePause,
  };
}
