"use client";

import { useGLTF } from "@react-three/drei";

export const HEAD_MODEL_URL = "/models/head.glb";

/**
 * The head model. useGLTF suspends while the file loads, so nothing is drawn
 * until it is ready (the viewer shows a loading message meanwhile).
 */
export function HeadModel() {
  const { scene } = useGLTF(HEAD_MODEL_URL);
  return <primitive object={scene} />;
}

// Start downloading as soon as this module is loaded.
useGLTF.preload(HEAD_MODEL_URL);
