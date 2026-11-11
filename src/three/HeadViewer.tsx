"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Canvas } from "@react-three/fiber";
import { CameraRig, type ViewName } from "./CameraRig";
import { HeadModel } from "./HeadModel";
import { PointMarkers } from "./PointMarkers";
import type { SurfaceHit, Vec3, ViewerPoint } from "./types";

const VIEWS: { name: ViewName; labelKey: string }[] = [
  { name: "left", labelKey: "viewLeft" },
  { name: "face", labelKey: "viewFace" },
  { name: "right", labelKey: "viewRight" },
  { name: "back", labelKey: "viewBack" },
  { name: "top", labelKey: "viewTop" },
];

export type HeadViewerProps = {
  points?: ViewerPoint[];
  selectedId?: string | null;
  /** A point being placed, not saved yet. */
  draft?: ViewerPoint | null;
  onSelectPoint?: (id: string) => void;
  /** When set, clicking the face reports the spot (used to place points). */
  onPickSurface?: (hit: SurfaceHit) => void;
  /** Turns the camera towards this spot when it changes. */
  focus?: Vec3 | null;
};

/**
 * Rendered next to the model inside the same Suspense boundary: it only
 * mounts once the model has finished loading.
 */
function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

export default function HeadViewer({
  points = [],
  selectedId,
  draft,
  onSelectPoint,
  onPickSurface,
  focus,
}: HeadViewerProps) {
  const t = useTranslations("Viewer");
  const [view, setView] = useState<ViewName>("face");
  const [nonce, setNonce] = useState(0);
  // Becomes true once the head model has actually been rendered.
  const [ready, setReady] = useState(false);

  return (
    <div className={`relative h-full w-full touch-none bg-stone-100 ${onPickSurface ? "cursor-crosshair" : ""}`}>
      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 35, near: 0.1, far: 20 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 2, 3]} intensity={1.1} />
        <directionalLight position={[-3, 1, 1]} intensity={0.4} />
        <Suspense fallback={null}>
          <HeadModel onPick={onPickSurface} />
          <ReadySignal onReady={() => setReady(true)} />
        </Suspense>
        <PointMarkers
          points={points}
          selectedId={selectedId}
          draft={draft}
          clickable={!onPickSurface}
          onSelect={onSelectPoint}
        />
        <CameraRig view={view} viewNonce={nonce} focus={focus} />
      </Canvas>

      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-500">
          {t("loading")}
        </div>
      )}

      <div
        role="group"
        aria-label={t("views")}
        className="absolute bottom-4 left-1/2 flex w-max max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-wrap justify-center gap-2"
      >
        {VIEWS.map(({ name, labelKey }) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              setView(name);
              setNonce((n) => n + 1);
            }}
            className="rounded-full bg-white/90 px-3 py-2 text-sm sm:px-4 font-medium text-stone-800 shadow transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
