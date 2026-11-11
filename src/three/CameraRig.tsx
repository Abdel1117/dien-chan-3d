"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type ViewName = "face" | "left" | "right";

/** Azimuth in radians. 0 = front (+Z). The person's left side is +X. */
export const VIEW_AZIMUTH: Record<ViewName, number> = {
  face: 0,
  left: Math.PI / 2,
  right: -Math.PI / 2,
};

// Limits keep the camera in front of the head (no view from behind).
const MAX_AZIMUTH = 1.75;
const MIN_POLAR = 0.6;
const MAX_POLAR = 2.2;

type CameraRigProps = {
  view: ViewName;
  /** Changes on each button press so the same view can be re-selected. */
  viewNonce: number;
};

export function CameraRig({ view, viewNonce }: CameraRigProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const target = useRef<{ azimuth: number; polar: number } | null>(null);

  useEffect(() => {
    target.current = { azimuth: VIEW_AZIMUTH[view], polar: Math.PI / 2 };
  }, [view, viewNonce]);

  useFrame((_, delta) => {
    const c = controls.current;
    const t = target.current;
    if (!c || !t) return;
    const k = 1 - Math.exp(-delta * 8);
    const az = c.getAzimuthalAngle();
    const po = c.getPolarAngle();
    c.setAzimuthalAngle(az + (t.azimuth - az) * k);
    c.setPolarAngle(po + (t.polar - po) * k);
    c.update();
    if (Math.abs(t.azimuth - az) < 0.002 && Math.abs(t.polar - po) < 0.002) {
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
      minAzimuthAngle={-MAX_AZIMUTH}
      maxAzimuthAngle={MAX_AZIMUTH}
      minPolarAngle={MIN_POLAR}
      maxPolarAngle={MAX_POLAR}
      // The user grabbing the model cancels any running view animation.
      onStart={() => {
        target.current = null;
      }}
    />
  );
}
