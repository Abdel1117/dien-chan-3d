import { useTranslations } from "next-intl";
import { visualFrame } from "../styles";

// The first steps of the « Bộ thăng » routine, as numbered on the chart.
const STEPS = [
  { numero: "127", nameKey: "demoPoint1" },
  { numero: "50", nameKey: "demoPoint2" },
  { numero: "19", nameKey: "demoPoint3" },
  { numero: "37", nameKey: "demoPoint4" },
] as const;

/** Step 2: the list of steps, as in the side panel of the 3D face. */
export function StepsVisual() {
  const t = useTranslations("Home");
  const te = useTranslations("Explorer");
  const dose = te("seconds", { n: 30 });

  return (
    <div
      data-visual
      aria-hidden="true"
      className={`${visualFrame} flex flex-col justify-center gap-2 px-4`}
    >
      {STEPS.map(({ numero, nameKey }, i) => (
        <div
          key={numero}
          data-step-row
          data-state={i === 0 ? "current" : i === 1 ? "next" : "todo"}
          className="group flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs transition-colors duration-300 data-[state=current]:border-stone-900"
        >
          <span
            data-step-dot
            className="size-2.5 flex-none rounded-full bg-teal-600 transition-colors duration-300 group-data-[state=current]:bg-red-600 group-data-[state=next]:bg-amber-500"
          />
          <span className="w-7 flex-none font-mono font-semibold text-stone-900">{numero}</span>
          <span className="min-w-0 flex-1 truncate text-stone-700">{t(nameKey)}</span>
          <span className="flex-none text-stone-500">{dose}</span>
        </div>
      ))}
    </div>
  );
}
