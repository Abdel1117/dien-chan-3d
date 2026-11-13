"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

const PERIOD = 1.4; // seconds per ripple

/**
 * Makes a mesh grow and fade out in a loop, like a ripple. Returns the ref to
 * put on the mesh; its material must be transparent.
 */
export function useRipple() {
  const mesh = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const k = (clock.elapsedTime % PERIOD) / PERIOD;
    m.scale.setScalar(1 + k * 2.6);
    (m.material as { opacity: number }).opacity = 0.45 * (1 - k);
  });

  return mesh;
}
