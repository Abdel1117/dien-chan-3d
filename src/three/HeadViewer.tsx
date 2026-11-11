"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Canvas } from "@react-three/fiber";
import { CameraRig, type ViewName } from "./CameraRig";
import { HeadModel } from "./HeadModel";

const VIEWS: { name: ViewName; labelKey: string }[] = [
  { name: "left", labelKey: "viewLeft" },
  { name: "face", labelKey: "viewFace" },
  { name: "right", labelKey: "viewRight" },
];

export default function HeadViewer() {
  const t = useTranslations("Viewer");
  const [view, setView] = useState<ViewName>("face");
  const [nonce, setNonce] = useState(0);

  return (
    <div className="relative h-full w-full touch-none bg-stone-100">
      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 35, near: 0.1, far: 20 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 2, 3]} intensity={1.1} />
        <directionalLight position={[-3, 1, 1]} intensity={0.4} />
        <HeadModel />
        <CameraRig view={view} viewNonce={nonce} />
      </Canvas>

      <div
        role="group"
        aria-label={t("views")}
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2"
      >
        {VIEWS.map(({ name, labelKey }) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              setView(name);
              setNonce((n) => n + 1);
            }}
            className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-stone-800 shadow transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
