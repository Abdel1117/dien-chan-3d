/** What the timer needs to know about a step. */
export type Side = "gauche" | "droite";

export type StepTiming = {
  cote: "gauche" | "droite" | "les_deux" | "central";
  mode_dosage: "duree" | "repetitions";
  duree_secondes: number | null;
  repetitions: number | null;
  cadence_par_minute: number | null;
  pause_apres_secondes: number;
};

export type Phase =
  | {
      kind: "step";
      stepIndex: number;
      tour: number;
      ms: number;
      /** Set when a step on both sides is played one side at a time. */
      side: Side | null;
    }
  | { kind: "pause"; stepIndex: number; tour: number; ms: number };

/** Presses per minute when a repetition step gives no cadence. */
export const DEFAULT_CADENCE = 60;

/** How long a step lasts, in milliseconds. */
export function stepDurationMs(step: StepTiming): number {
  if (step.mode_dosage === "duree") return (step.duree_secondes ?? 0) * 1000;
  const cadence = step.cadence_par_minute ?? DEFAULT_CADENCE;
  return Math.round(((step.repetitions ?? 0) / cadence) * 60_000);
}

/**
 * Flattens a parcours into the list of phases the timer plays: every step of
 * every tour, each followed by its pause. A step on both sides is played
 * twice, left then right, each side for the full duration. The pause after
 * the very last step is dropped, and steps with no duration are skipped.
 */
export function buildPhases(steps: readonly StepTiming[], tours: number): Phase[] {
  const phases: Phase[] = [];
  for (let tour = 1; tour <= Math.max(1, tours); tour++) {
    steps.forEach((step, stepIndex) => {
      const ms = stepDurationMs(step);
      if (ms <= 0) return;
      const sides: (Side | null)[] = step.cote === "les_deux" ? ["gauche", "droite"] : [null];
      for (const side of sides) phases.push({ kind: "step", stepIndex, tour, ms, side });
      if (step.pause_apres_secondes > 0) {
        phases.push({ kind: "pause", stepIndex, tour, ms: step.pause_apres_secondes * 1000 });
      }
    });
  }
  if (phases.at(-1)?.kind === "pause") phases.pop();
  return phases;
}

export type Position = { index: number; elapsed: number };

/**
 * Moves the timer forward to `elapsed` ms into phase `index`, crossing as many
 * phases as needed. This is what keeps the timer right after the browser
 * throttled a background tab: the clock decides, not the number of ticks.
 * `index === phases.length` means the parcours is finished.
 */
export function advance(phases: readonly Phase[], position: Position): Position {
  let { index, elapsed } = position;
  while (index < phases.length && elapsed >= phases[index].ms) {
    elapsed -= phases[index].ms;
    index++;
  }
  return index >= phases.length ? { index: phases.length, elapsed: 0 } : { index, elapsed };
}

/** Repetitions done so far in a repetition step (1-based count of presses). */
export function repetitionsDone(step: StepTiming, elapsedMs: number): number {
  const total = step.repetitions ?? 0;
  const cadence = step.cadence_par_minute ?? DEFAULT_CADENCE;
  return Math.min(total, Math.floor((elapsedMs / 60_000) * cadence) + 1);
}
