"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { HeroHead, type HeroHeadProps } from "./HeroHead";

/**
 * The 3D canvas of the home page: camera and lights around the head. It is
 * not draggable (the page must keep scrolling under the finger); the head
 * turns by itself towards the current point.
 */
export default function HeroScene(props: HeroHeadProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.02, 2.05], fov: 35, near: 0.1, far: 20 }}
      dpr={[1, 2]}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 2, 3]} intensity={1.1} />
      <directionalLight position={[-3, 1, 1]} intensity={0.4} />
      <Suspense fallback={null}>
        <HeroHead {...props} />
      </Suspense>
    </Canvas>
  );
}
