import { createTimeline, svg } from "animejs";
import type { InViewMotion } from "./playInView";

const COUNTDOWN_MS = 4200;

/** TimerVisual: the ring fills while the seconds count down. */
export function timerLoop(root: HTMLElement): InViewMotion | null {
  const ring = root.querySelector<SVGCircleElement>("[data-timer-ring]");
  const seconds = root.querySelector<SVGTextElement>("[data-timer-seconds]");
  if (!ring || !seconds) return null;

  const from = Number(seconds.textContent) || 30;
  const clock = { left: from };

  const timer = createTimeline({ loop: 1, loopDelay: 800, autoplay: false });
  timer
    .add(
      svg.createDrawable(ring),
      { draw: ["0 0", "0 1"], duration: COUNTDOWN_MS, ease: "linear" },
      0,
    )
    .add(
      clock,
      {
        left: [from, 0],
        duration: COUNTDOWN_MS,
        ease: "linear",
        onUpdate: () => {
          seconds.textContent = String(Math.ceil(clock.left));
        },
      },
      0,
    )
    .add(seconds, { scale: [1, 1.25, 1], duration: 500, ease: "outQuad" }, COUNTDOWN_MS);
  return { target: ring, motion: timer };
}
