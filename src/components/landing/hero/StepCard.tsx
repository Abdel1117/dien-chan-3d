"use client";

import { useTranslations } from "next-intl";
import type { Etape } from "@/lib/supabase/queries";
import { useDosageLabel } from "../hooks/useDosageLabel";
import { useRingProgress } from "../hooks/useRingProgress";

// The preview moves on faster than a real session: one step every 3.2 s.
const STEP_MS = 3200;
const RING = 2 * Math.PI * 17;

type StepCardProps = {
  etape: Etape;
  /** Position of the step, starting at 0, and the number of steps. */
  index: number;
  count: number;
  /** While true the ring fills; when it is full, `onDone` is called. */
  playing: boolean;
  onDone: () => void;
};

/** The current step of the preview: point number in a ring, name and dosage. */
export function StepCard({ etape, index, count, playing, onDone }: StepCardProps) {
  const t = useTranslations("Player");
  const dosageLabel = useDosageLabel();
  const { ring, dashOffset } = useRingProgress({
    circumference: RING,
    durationMs: STEP_MS,
    playing,
    restartKey: etape.id,
    onDone,
  });

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-lg shadow-stone-900/5 backdrop-blur">
      <span className="relative grid size-11 flex-none place-items-center">
        <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
          <circle cx="20" cy="20" r="17" fill="none" stroke="#e7e5e4" strokeWidth="3" />
          <circle
            ref={ring}
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke="#dc2626"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="font-mono text-xs font-semibold text-stone-900">
          {etape.point.numero}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-stone-900">
          {etape.point.nom}
        </span>
        <span className="block truncate text-xs text-stone-500">
          {t("stepOf", { i: index + 1, n: count })} · {dosageLabel(etape)}
        </span>
      </span>
    </div>
  );
}
