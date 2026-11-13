import { animate, createTimeline } from "animejs";
import type { InViewMotion } from "./playInView";

const HOLD_MS = 1300;

/**
 * StepsVisual: the current step (red) moves down the list and the one after
 * it is orange, as on the 3D face.
 */
export function stepsLoop(root: HTMLElement): InViewMotion | null {
  const rows = [...root.querySelectorAll<HTMLElement>("[data-step-row]")];
  if (rows.length < 2) return null;

  const play = (current: number) => {
    rows.forEach((row, i) => {
      row.dataset.state = i === current ? "current" : i === current + 1 ? "next" : "todo";
    });
    const dot = rows[current].querySelector("[data-step-dot]");
    if (dot) animate(dot, { scale: [1, 1.8, 1], duration: 520, ease: "outQuad" });
  };

  const steps = createTimeline({ loop: 1, loopDelay: HOLD_MS, autoplay: false });
  rows.forEach((_, k) => steps.call(() => play(k), k * HOLD_MS));
  return { target: rows[0], motion: steps };
}
