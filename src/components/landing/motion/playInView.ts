import { onScroll } from "animejs";

/** Anything that can be started over and paused: an animation or a timeline. */
export type Playable = { restart: () => unknown; pause: () => unknown };

/** A motion, and the element whose visibility decides when it plays. */
export type InViewMotion = { target: Element; motion: Playable };

/** Starts the motion when its target scrolls into view, stops it when it leaves. */
export function playInView({ target, motion }: InViewMotion) {
  onScroll({
    target: target.closest("[data-visual]") ?? target,
    enter: "bottom top",
    leave: "top bottom",
    repeat: true,
    onEnter: () => motion.restart(),
    onLeave: () => motion.pause(),
  });
}
