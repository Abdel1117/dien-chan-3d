"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

type RingProgressOptions = {
  /** Length of the circle's outline (2πr), also its dash array. */
  circumference: number;
  durationMs: number;
  /** While true the ring fills; it starts over when `restartKey` changes. */
  playing: boolean;
  restartKey: string;
  /** Called when the ring is full. */
  onDone: () => void;
};

/**
 * Fills an SVG circle like a timer. Returns the ref to put on the circle and
 * the dash offset to render it with (empty while playing, full otherwise).
 */
export function useRingProgress({
  circumference,
  durationMs,
  playing,
  restartKey,
  onDone,
}: RingProgressOptions) {
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el || !playing) return;
    const filling = animate(el, {
      strokeDashoffset: [circumference, 0],
      duration: durationMs,
      ease: "linear",
      onComplete: onDone,
    });
    return () => {
      filling.revert();
    };
  }, [circumference, durationMs, playing, restartKey, onDone]);

  return { ring, dashOffset: playing ? circumference : 0 };
}
