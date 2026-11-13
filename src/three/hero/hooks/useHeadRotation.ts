"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { ViewerPoint } from "../../types";

// The head never turns further than this, so the face stays readable.
const MAX_TURN = 0.75;

/**
 * Where the head should turn (rotation around Y, radians). It brings a
 * one-sided current point to face the visitor, looks straight ahead for a
 * two-sided one, and sways gently when there is no point at all.
 */
function targetRotation(current: ViewerPoint[], time: number) {
  if (current.length > 1) return 0;
  const focus = current[0]?.position;
  const angle = focus ? -Math.atan2(focus[0], focus[2]) : Math.sin(time * 0.45) * 0.5;
  return Math.max(-MAX_TURN, Math.min(MAX_TURN, angle));
}

/**
 * Turns a group smoothly towards the current point(s). Returns the ref to
 * put on the group. When `animated` is false it eases back to the front.
 */
export function useHeadRotation(current: ViewerPoint[], animated: boolean) {
  const group = useRef<Group>(null);

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const target = animated ? targetRotation(current, clock.elapsedTime) : 0;
    g.rotation.y += (target - g.rotation.y) * (1 - Math.exp(-delta * 3));
  });

  return group;
}
