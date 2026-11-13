"use client";

import { useEffect } from "react";
import { HeadModel } from "../HeadModel";
import type { ViewerPoint } from "../types";
import { HeroMarkers } from "./HeroMarkers";
import { useHeadRotation } from "./hooks/useHeadRotation";

export type HeroHeadProps = {
  points: ViewerPoint[];
  /** Id (or group) of the point being stimulated. */
  currentId: string | null;
  /** When false the head stands still, facing the visitor. */
  animated: boolean;
  /** Called once the model is loaded and drawn. */
  onReady?: () => void;
};

/** Rendered next to the model: it only mounts once the model has loaded. */
function ReadySignal({ onReady }: { onReady?: () => void }) {
  useEffect(() => onReady?.(), [onReady]);
  return null;
}

/** The head and its markers, turning together towards the current point. */
export function HeroHead({ points, currentId, animated, onReady }: HeroHeadProps) {
  const current = points.filter((p) => (p.group ?? p.id) === currentId);
  const group = useHeadRotation(current, animated);

  return (
    <group ref={group}>
      <HeadModel />
      <ReadySignal onReady={onReady} />
      <HeroMarkers points={points} currentId={currentId} animated={animated} />
    </group>
  );
}
