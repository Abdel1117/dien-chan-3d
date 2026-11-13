import type { Side } from "@/lib/minutage/sequence";
import type { Etape } from "@/lib/supabase/queries";
import type { Vec3, ViewerPoint } from "@/three/types";

/**
 * Markers for the steps of a parcours. A point is drawn where it was placed;
 * a step on both sides also gets its mirror image across the face's vertical
 * midline (x = 0). The person's left is +X. The viewer colours the selected
 * group red, the `next` ones orange and the rest teal.
 *
 * `side` is set while the timer plays a two-sided step one side at a time:
 * only that side is current, and the other side is what comes next while the
 * left one is being done.
 */
export function toViewerPoints(
  etapes: Etape[],
  selected: number | null,
  side: Side | null,
): ViewerPoint[] {
  const current = selected !== null ? etapes[selected] : undefined;
  const nextId = selected !== null ? etapes[selected + 1]?.id : undefined;
  const waitingForOtherSide = current?.cote === "les_deux" && side === "gauche";

  return etapes.flatMap((e) => {
    const { pos_x, pos_y, pos_z, normal_x, normal_y, normal_z } = e.point;
    const marker = (mirror: boolean): ViewerPoint => {
      const x = mirror ? -pos_x : pos_x;
      const markerSide: Side = x >= 0 ? "gauche" : "droite";
      const split = e.id === current?.id && side !== null && e.cote === "les_deux";
      return {
        id: mirror ? `${e.id}:mirror` : e.id,
        group: split && markerSide !== side ? `${e.id}:other` : e.id,
        next: split
          ? side === "gauche" && markerSide === "droite"
          : e.id === nextId && !waitingForOtherSide,
        position: [x, pos_y, pos_z],
        normal: [mirror ? -normal_x : normal_x, normal_y, normal_z],
      };
    };
    return e.cote === "les_deux" ? [marker(false), marker(true)] : [marker(false)];
  });
}

/**
 * Where the camera should look: the current point. A two-sided step is
 * viewed from the front unless the timer is on one side, then from that side.
 */
export function cameraFocus(etape: Etape | undefined, side: Side | null): Vec3 | null {
  if (!etape) return null;
  const { pos_x, pos_y, pos_z } = etape.point;
  if (etape.cote !== "les_deux") return [pos_x, pos_y, pos_z];
  if (side === null) return [0, pos_y, pos_z];
  return [Math.abs(pos_x) * (side === "gauche" ? 1 : -1), pos_y, pos_z];
}
