"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import {
  getParcoursBySlug,
  getParcoursList,
  type ParcoursDetail,
} from "@/lib/supabase/queries";

const PREFERRED_SLUG = "bo-thang";

/**
 * Loads the published parcours played by the home page preview: « Bộ thăng »
 * when it exists, otherwise the first one. Stays null without data (database
 * unreachable or empty).
 */
export function useDemoParcours(locale: Locale) {
  const [parcours, setParcours] = useState<ParcoursDetail | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const client = createClient();
        const list = await getParcoursList(client, locale);
        const pick = list.find((p) => p.slug === PREFERRED_SLUG) ?? list[0];
        if (!pick) return;
        const detail = await getParcoursBySlug(client, pick.slug, locale);
        if (!cancelled && detail && detail.etapes.length > 0) setParcours(detail);
      } catch {
        // No preview data: the head alone is shown.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return parcours;
}
