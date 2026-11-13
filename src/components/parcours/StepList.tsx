"use client";

import { useTranslations } from "next-intl";
import { useDosageLabel } from "@/hooks/useDosageLabel";
import type { Etape } from "@/lib/supabase/queries";

const LEGEND = [
  { color: "bg-red-600", labelKey: "legendCurrent" },
  { color: "bg-amber-500", labelKey: "legendNext" },
  { color: "bg-teal-600", labelKey: "legendOther" },
] as const;

/** The colour legend and the steps of a parcours; the selected one is framed. */
export function StepList({
  etapes,
  selected,
  onSelect,
}: {
  etapes: Etape[];
  selected: number | null;
  onSelect: (index: number) => void;
}) {
  const t = useTranslations("Explorer");
  const dosageLabel = useDosageLabel();

  return (
    <>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600">
        {LEGEND.map(({ color, labelKey }) => (
          <span key={labelKey}>
            <span aria-hidden="true" className={`mr-1 inline-block size-2.5 rounded-full ${color}`} />
            {t(labelKey)}
          </span>
        ))}
      </p>

      <ol className="mt-4 space-y-2">
        {etapes.map((e, i) => (
          <li key={e.id}>
            <button
              type="button"
              aria-current={selected === i}
              onClick={() => onSelect(i)}
              className={`w-full rounded-xl border p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${
                selected === i ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-400"
              }`}
            >
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-sm font-medium text-stone-900">{e.point.numero}</span>
                <span className="min-w-0 flex-1 truncate font-medium text-stone-900">{e.point.nom}</span>
                <span className="shrink-0 text-sm text-stone-600">{dosageLabel(e)}</span>
              </span>
              <span className="mt-1 block text-xs text-stone-500">
                {t(`side_${e.cote}`)}
                {e.point.zone ? ` · ${e.point.zone}` : ""}
              </span>
              {selected === i && e.note && (
                <span className="mt-2 block text-sm text-stone-700">{e.note}</span>
              )}
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}
