import { useTranslations } from "next-intl";
import { wrap } from "../styles";

/** Brand and the credit line of the 3D model (CC BY). */
export function LandingFooter() {
  const th = useTranslations("Header");
  const tv = useTranslations("Viewer");

  return (
    <footer className="border-t border-stone-200">
      <div
        className={`${wrap} flex flex-col gap-2 py-8 text-xs text-stone-500 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8`}
      >
        <p className="font-medium text-stone-700">{th("brand")}</p>
        <p className="max-w-xl sm:text-right">{tv("credit")}</p>
      </div>
    </footer>
  );
}
