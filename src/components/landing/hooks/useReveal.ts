"use client";

import { useEffect, type RefObject } from "react";
import { animate } from "animejs";

/**
 * Fades and scales an element in once `ready` is true. The element starts
 * hidden (`opacity-0`); without motion it is simply shown.
 */
export function useReveal(
  ref: RefObject<HTMLElement | null>,
  ready: boolean,
  animated: boolean,
) {
  useEffect(() => {
    const el = ref.current;
    if (!ready || !el) return;
    if (!animated) {
      el.style.opacity = "1";
      return;
    }
    const reveal = animate(el, {
      opacity: [0, 1],
      scale: [0.94, 1],
      duration: 900,
      ease: "outQuart",
    });
    return () => {
      reveal.revert();
    };
  }, [ref, ready, animated]);
}
