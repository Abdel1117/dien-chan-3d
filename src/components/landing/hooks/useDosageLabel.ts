import { useCallback } from "react";
import { useTranslations } from "next-intl";
import type { Etape } from "@/lib/supabase/queries";

/**
 * Returns a function giving a step's dosage in words: "30 s",
 * "12 répétitions", or "30 s par côté" for a step done on both sides.
 */
export function useDosageLabel() {
  const t = useTranslations("Explorer");

  return useCallback(
    (etape: Etape) => {
      const amount =
        etape.mode_dosage === "duree"
          ? t("seconds", { n: etape.duree_secondes ?? 0 })
          : t("reps", { n: etape.repetitions ?? 0 });
      return etape.cote === "les_deux" ? t("perSide", { amount }) : amount;
    },
    [t],
  );
}
