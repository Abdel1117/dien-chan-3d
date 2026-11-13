import { animate, createTimeline } from "animejs";
import type { InViewMotion } from "./playInView";

const HOLD_MS = 1400;
// Indexes into the images: face, left profile, face, right profile, face.
const TOUR = [1, 0, 1, 2, 1];

/** ViewsVisual: the head switches views, and the matching button lights up. */
export function viewsLoop(root: HTMLElement): InViewMotion | null {
  const views = [...root.querySelectorAll<HTMLElement>("[data-view-img]")];
  const pills = [...root.querySelectorAll<HTMLElement>("[data-view-pill]")];
  if (views.length < 3) return null;

  const show = (active: number) => {
    views.forEach((view, i) =>
      animate(view, { opacity: i === active ? 1 : 0, duration: 380, ease: "outQuad" }),
    );
    pills.forEach((pill, i) => {
      pill.dataset.active = String(i === active);
    });
  };

  const tour = createTimeline({ loop: 1, loopDelay: HOLD_MS, autoplay: false });
  TOUR.forEach((view, k) => tour.call(() => show(view), k * HOLD_MS));
  return { target: views[0], motion: tour };
}
