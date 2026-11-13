import type { Etape } from "@/lib/supabase/queries";
import type { ViewerPoint } from "@/three/types";

/**
 * Markers for the preview. A step on both sides also gets its mirror image
 * across the face's midline (x = 0); both share the step id as their group.
 */
export function toDemoPoints(etapes: Etape[], nextId?: string): ViewerPoint[] {
  return etapes.flatMap((e) => {
    const { pos_x, pos_y, pos_z, normal_x, normal_y, normal_z } = e.point;
    const marker = (mirror: boolean): ViewerPoint => ({
      id: mirror ? `${e.id}:mirror` : e.id,
      group: e.id,
      next: e.id === nextId,
      position: [mirror ? -pos_x : pos_x, pos_y, pos_z],
      normal: [mirror ? -normal_x : normal_x, normal_y, normal_z],
    });
    return e.cote === "les_deux" ? [marker(false), marker(true)] : [marker(false)];
  });
}
