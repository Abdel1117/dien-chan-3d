"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type ViewName = "face" | "left" | "right" | "back" | "top";

/** Azimuth in radians. 0 = front (+Z). The person's left side is +X. */
export const VIEW_AZIMUTH: Record<ViewName, number | null> = {
  face: 0,
  left: Math.PI / 2,
  right: -Math.PI / 2,
  back: Math.PI,
  // The top view keeps the current azimuth: no spin, just tilt up.
  top: null,
};

// The camera may go all around and above the head, but not below it.
// MIN_POLAR is never exactly 0: OrbitControls gets unstable at the pole.
const MIN_POLAR = 0.05;
const MAX_POLAR = 2.2;

/** Polar angle in radians. Pi/2 = level with the head, 0 = straight above. */
const VIEW_POLAR: Record<ViewName, number> = {
  face: Math.PI / 2,
  left: Math.PI / 2,
  right: Math.PI / 2,
  back: Math.PI / 2,
  top: MIN_POLAR,
};

/** Shortest signed angle from `from` to `to`, in (-PI, PI]. */
function angleDelta(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

type CameraRigProps = {
  view: ViewName;
  /** Changes on each button press so the same view can be re-selected. */
  viewNonce: number;
};

export function CameraRig({ view, viewNonce }: CameraRigProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const target = useRef<{ azimuth: number | null; polar: number } | null>(null);

  useEffect(() => {
    target.current = { azimuth: VIEW_AZIMUTH[view], polar: VIEW_POLAR[view] };
  }, [view, viewNonce]);

  useFrame((_, delta) => {
    const c = controls.current;
    const t = target.current;
    if (!c || !t) return;
    const k = 1 - Math.exp(-delta * 8);
    const az = c.getAzimuthalAngle();
    const po = c.getPolarAngle();
    const dAz = t.azimuth === null ? 0 : angleDelta(az, t.azimuth);
    c.setAzimuthalAngle(az + dAz * k);
    c.setPolarAngle(po + (t.polar - po) * k);
    c.update();
    if (Math.abs(dAz) < 0.002 && Math.abs(t.polar - po) < 0.002) {
      target.current = null;
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={0.9}
      maxDistance={3}
      minPolarAngle={MIN_POLAR}
      maxPolarAngle={MAX_POLAR}
      // The user grabbing the model cancels any running view animation.
      onStart={() => {
        target.current = null;
      }}
    />
  );
}
