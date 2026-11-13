"use client";

import type { ReactNode } from "react";
import { useLandingMotion } from "../hooks/useLandingMotion";

/**
 * Wraps the home page so its server-rendered markup gets animated (elements
 * are found through data attributes). Everything is readable without it:
 * with reduced motion or no JavaScript the page simply stands still.
 */
export function LandingMotion({ children }: { children: ReactNode }) {
  const root = useLandingMotion<HTMLDivElement>();

  return (
    <div ref={root} className="landing">
      {children}
    </div>
  );
}
