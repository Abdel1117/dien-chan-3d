"use client";

import type { Vec3 } from "../types";
import { useRipple } from "./hooks/useRipple";

/** A red ripple growing from the current point and fading out. */
export function Halo({ position, radius }: { position: Vec3; radius: number }) {
  const mesh = useRipple();

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[radius, 20, 14]} />
      <meshBasicMaterial color="#dc2626" transparent opacity={0.4} depthWrite={false} />
    </mesh>
  );
}
