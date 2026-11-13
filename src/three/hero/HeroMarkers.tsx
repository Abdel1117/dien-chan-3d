"use client";

import type { ViewerPoint } from "../types";
import { Halo } from "./Halo";

const RADIUS = 0.009;
const CURRENT_RADIUS = RADIUS * 1.4;

const RED = "#dc2626"; // current point
const AMBER = "#f59e0b"; // next point
const TEAL = "#0d9488"; // the others

/** The points of the preview; the current one is larger, red, and pulses. */
export function HeroMarkers({
  points,
  currentId,
  animated,
}: {
  points: ViewerPoint[];
  currentId: string | null;
  animated: boolean;
}) {
  return (
    <>
      {points.map((p) => {
        const current = (p.group ?? p.id) === currentId;
        return (
          <group key={p.id}>
            <mesh position={p.position}>
              <sphereGeometry args={[current ? CURRENT_RADIUS : RADIUS, 16, 12]} />
              <meshBasicMaterial color={current ? RED : p.next ? AMBER : TEAL} />
            </mesh>
            {current && animated && <Halo position={p.position} radius={CURRENT_RADIUS} />}
          </group>
        );
      })}
    </>
  );
}
