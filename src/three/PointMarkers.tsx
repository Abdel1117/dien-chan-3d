"use client";

import type { ViewerPoint } from "./types";

const RADIUS = 0.008;

function color(p: ViewerPoint, selected: boolean) {
  if (selected) return "#dc2626";
  if (p.next) return "#f59e0b";
  if (p.obsolete) return "#9ca3af";
  return "#0d9488";
}

/**
 * Small spheres sitting just above the skin. While the user is placing a
 * point, markers ignore clicks so they never hide the surface behind them.
 */
export function PointMarkers({
  points,
  selectedId,
  draft,
  clickable,
  onSelect,
}: {
  points: ViewerPoint[];
  selectedId?: string | null;
  draft?: ViewerPoint | null;
  clickable: boolean;
  onSelect?: (id: string) => void;
}) {
  const all = draft ? [...points.filter((p) => p.id !== draft.id), draft] : points;
  return (
    <>
      {all.map((p) => {
        const selected = (p.group ?? p.id) === selectedId || p.id === draft?.id;
        const lift = 0; // centred on the skin: a small dome, never floating
        return (
          <mesh
            key={p.id}
            position={[
              p.position[0] + p.normal[0] * lift,
              p.position[1] + p.normal[1] * lift,
              p.position[2] + p.normal[2] * lift,
            ]}
            raycast={clickable ? undefined : () => null}
            onClick={
              clickable && onSelect
                ? (e) => {
                    if (e.delta > 3) return;
                    e.stopPropagation();
                    onSelect(p.group ?? p.id);
                  }
                : undefined
            }
          >
            <sphereGeometry args={[selected ? RADIUS * 1.4 : RADIUS, 16, 12]} />
            <meshBasicMaterial color={color(p, selected)} />
          </mesh>
        );
      })}
    </>
  );
}
