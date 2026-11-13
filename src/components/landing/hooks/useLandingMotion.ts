"use client";

import { useEffect, useRef } from "react";
import { createScope } from "animejs";
import { heroIntro } from "../motion/heroIntro";
import { playInView } from "../motion/playInView";
import { statementHighlight } from "../motion/statementHighlight";
import { stepsLoop } from "../motion/stepsLoop";
import { timerLoop } from "../motion/timerLoop";
import { viewsLoop } from "../motion/viewsLoop";

/**
 * Starts the home page animations inside the element holding the returned
 * ref, and cleans them up on unmount. With reduced motion nothing starts.
 */
export function useLandingMotion<T extends HTMLElement>() {
  const root = useRef<T>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const scope = createScope({
      root: el,
      mediaQueries: { reduce: "(prefers-reduced-motion: reduce)" },
    }).add((self) => {
      if (self?.matches.reduce) return;

      heroIntro(el);
      for (const loop of [viewsLoop(el), stepsLoop(el), timerLoop(el)]) {
        if (loop) playInView(loop);
      }
      statementHighlight(el);
    });

    return () => scope.revert();
  }, []);

  return root;
}
