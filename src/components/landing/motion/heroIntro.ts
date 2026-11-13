import { createTimeline, splitText, stagger, utils } from "animejs";

/** Hero entrance: the title rises word by word, then the rest follows. */
export function heroIntro(root: HTMLElement) {
  const intro = createTimeline({ defaults: { ease: "outExpo", duration: 1000 } });

  const title = root.querySelector<HTMLElement>("[data-enter-title]");
  if (title) {
    const { words } = splitText(title, { words: true });
    utils.set(title, { opacity: 1 });
    intro.add(words, { opacity: [0, 1], y: ["0.6em", 0], delay: stagger(55) }, 0);
  }

  const rest = root.querySelectorAll("[data-enter]");
  if (rest.length > 0) {
    intro.add(rest, { opacity: [0, 1], y: [16, 0], delay: stagger(110) }, 350);
  }
}
