"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import type { SurfaceHit } from "./types";

export const HEAD_MODEL_URL = "/models/head.glb";

/**
 * The head model. useGLTF suspends while the file loads, so nothing is drawn
 * until it is ready (the viewer shows a loading message meanwhile).
 * When `onPick` is given, a click (not a drag) on the surface reports where.
 */
export function HeadModel({ onPick }: { onPick?: (hit: SurfaceHit) => void }) {
  const { scene } = useGLTF(HEAD_MODEL_URL);
  // useGLTF caches one scene for the whole app. Each viewer gets its own copy
  // of the object tree (geometry and materials stay shared), and `dispose={null}`
  // stops a closing viewer from freeing those shared GPU resources, which
  // would leave the next viewer with an invisible head.
  const copy = useMemo(() => scene.clone(true), [scene]);
  return (
    <primitive
      object={copy}
      dispose={null}
      onClick={
        onPick
          ? (e: ThreeEvent<MouseEvent>) => {
              // A drag (rotating the head) also ends in a click: ignore it.
              if (e.delta > 3 || !e.face) return;
              e.stopPropagation();
              const n = e.face.normal
                .clone()
                .transformDirection(e.object.matrixWorld)
                .normalize();
              onPick({
                position: [e.point.x, e.point.y, e.point.z],
                normal: [n.x, n.y, n.z],
              });
            }
          : undefined
      }
    />
  );
}

// Start downloading as soon as this module is loaded.
useGLTF.preload(HEAD_MODEL_URL);
