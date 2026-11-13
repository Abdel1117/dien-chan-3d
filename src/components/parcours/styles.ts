// Class names and small helpers shared by the 3D face page.

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900";

export const chip = `rounded-full px-3 py-1.5 text-sm font-medium ${focus}`;

const button = `rounded-full px-4 py-2 text-sm font-medium disabled:opacity-40 ${focus}`;
export const primaryButton = `${button} bg-stone-900 text-white hover:bg-stone-700`;
export const secondaryButton = `${button} border border-stone-300 text-stone-800 hover:bg-stone-100`;

/** Milliseconds as m:ss, rounded up so the last second shows as 0:01. */
export function clockText(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
