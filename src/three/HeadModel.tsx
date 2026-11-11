"use client";

import { useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { ProvisionalHead } from "./ProvisionalHead";

export const HEAD_MODEL_URL = "/models/head.glb";

function GltfHead() {
  const { scene } = useGLTF(HEAD_MODEL_URL);
  return <primitive object={scene} />;
}

/**
 * Loads public/models/head.glb when it exists, otherwise shows the
 * provisional head.
 */
export function HeadModel() {
  const [hasModel, setHasModel] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(HEAD_MODEL_URL, { method: "HEAD", signal: controller.signal })
      .then((res) => setHasModel(res.ok))
      .catch(() => setHasModel(false));
    return () => controller.abort();
  }, []);

  return hasModel ? <GltfHead /> : <ProvisionalHead />;
}
