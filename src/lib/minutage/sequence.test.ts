import { describe, expect, it } from "vitest";
import {
  advance,
  buildPhases,
  repetitionsDone,
  stepDurationMs,
  type StepTiming,
} from "./sequence";

const timed = (s: number, pause = 0): StepTiming => ({
  cote: "central",
  mode_dosage: "duree",
  duree_secondes: s,
  repetitions: null,
  cadence_par_minute: null,
  pause_apres_secondes: pause,
});
const reps = (n: number, cadence: number | null, pause = 0): StepTiming => ({
  cote: "central",
  mode_dosage: "repetitions",
  duree_secondes: null,
  repetitions: n,
  cadence_par_minute: cadence,
  pause_apres_secondes: pause,
});

describe("stepDurationMs", () => {
  it("uses the duration for timed steps", () => {
    expect(stepDurationMs(timed(30))).toBe(30_000);
  });
  it("derives the duration from repetitions and cadence", () => {
    expect(stepDurationMs(reps(20, 60))).toBe(20_000);
    expect(stepDurationMs(reps(20, 120))).toBe(10_000);
    expect(stepDurationMs(reps(30, null))).toBe(30_000); // default cadence
  });
});

describe("buildPhases", () => {
  it("interleaves pauses and drops the final one", () => {
    const phases = buildPhases([timed(30, 5), timed(10, 5)], 1);
    expect(phases.map((p) => [p.kind, p.stepIndex, p.ms])).toEqual([
      ["step", 0, 30_000],
      ["pause", 0, 5_000],
      ["step", 1, 10_000],
    ]);
  });
  it("repeats the steps for each tour, keeping pauses between tours", () => {
    const phases = buildPhases([timed(10, 5)], 2);
    expect(phases.map((p) => [p.kind, p.tour])).toEqual([
      ["step", 1],
      ["pause", 1],
      ["step", 2],
    ]);
  });
  it("plays a step on both sides left then right, with one pause after", () => {
    const phases = buildPhases([{ ...timed(30, 5), cote: "les_deux" }, timed(10)], 1);
    expect(phases.map((p) => [p.kind, p.kind === "step" ? p.side : null, p.ms])).toEqual([
      ["step", "gauche", 30_000],
      ["step", "droite", 30_000],
      ["pause", null, 5_000],
      ["step", null, 10_000],
    ]);
  });
  it("skips steps without a duration", () => {
    expect(buildPhases([timed(0), timed(10)], 1)).toHaveLength(1);
  });
});

describe("advance", () => {
  const phases = buildPhases([timed(30, 5), timed(10)], 1); // 30s, 5s, 10s
  it("stays in the phase while time remains", () => {
    expect(advance(phases, { index: 0, elapsed: 29_999 })).toEqual({ index: 0, elapsed: 29_999 });
  });
  it("moves on exactly at the end, carrying the overflow", () => {
    expect(advance(phases, { index: 0, elapsed: 30_250 })).toEqual({ index: 1, elapsed: 250 });
  });
  it("crosses several phases after a long background gap", () => {
    expect(advance(phases, { index: 0, elapsed: 37_000 })).toEqual({ index: 2, elapsed: 2_000 });
  });
  it("reports the end of the parcours", () => {
    expect(advance(phases, { index: 0, elapsed: 999_999 })).toEqual({ index: 3, elapsed: 0 });
  });
});

describe("repetitionsDone", () => {
  it("counts presses at the cadence and never exceeds the total", () => {
    const step = reps(20, 60);
    expect(repetitionsDone(step, 0)).toBe(1);
    expect(repetitionsDone(step, 9_500)).toBe(10);
    expect(repetitionsDone(step, 60_000)).toBe(20);
  });
});
