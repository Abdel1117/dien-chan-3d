import { animate, onScroll, splitText, stagger } from "animejs";

/** The statement lights up word by word as it is scrolled through. */
export function statementHighlight(root: HTMLElement) {
  const statement = root.querySelector<HTMLElement>("[data-statement]");
  if (!statement) return;

  const { words } = splitText(statement, { words: true });
  animate(words, {
    opacity: [0.22, 1],
    duration: 400,
    delay: stagger(140),
    ease: "linear",
    autoplay: onScroll({
      target: statement,
      enter: "bottom top",
      leave: "center bottom",
      sync: 0.4,
    }),
  });
}
