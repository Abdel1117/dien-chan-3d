import { useTranslations } from "next-intl";
import { visualFrame } from "../styles";

/** Step 3: the timer, with its ring, the seconds left and its buttons. */
export function TimerVisual() {
  const t = useTranslations("Player");

  return (
    <div
      data-visual
      aria-hidden="true"
      className={`${visualFrame} flex flex-col items-center justify-center gap-2.5`}
    >
      <p className="text-xs font-medium text-stone-500">{t("stepOf", { i: 1, n: 10 })}</p>
      <svg viewBox="0 0 120 120" className="size-[46%]">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#d6d3d1" strokeWidth="7" />
        <circle
          data-timer-ring
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="#dc2626"
          strokeWidth="7"
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text
          data-timer-seconds
          x="60"
          y="72"
          textAnchor="middle"
          fontSize="36"
          fontWeight="600"
          fill="#1c1917"
          className="origin-center font-mono [transform-box:fill-box]"
        >
          30
        </text>
      </svg>
      <div className="flex gap-1.5">
        <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
          {t("pauseButton")}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-stone-700 shadow-sm">
          {t("next")}
        </span>
      </div>
    </div>
  );
}
