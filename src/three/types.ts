export type Vec3 = [number, number, number];

/** A spot on the head surface, in model coordinates. */
export type SurfaceHit = { position: Vec3; normal: Vec3 };

export type ViewerPoint = {
  id: string;
  /** Markers sharing a group are selected together (a point and its mirror). */
  group?: string;
  position: Vec3;
  normal: Vec3;
  /** The step that comes right after the selected one: shown in orange. */
  next?: boolean;
  /** Placed on another version of the model: shown greyed out. */
  obsolete?: boolean;
};
