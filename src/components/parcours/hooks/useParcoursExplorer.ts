"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { Side } from "@/lib/minutage/sequence";
import { createClient } from "@/lib/supabase/client";
import {
  getParcoursBySlug,
  getParcoursList,
  type ParcoursDetail,
  type ParcoursSummary,
} from "@/lib/supabase/queries";
import type { Categorie } from "@/lib/supabase/types";

export type CategoryFilter = Categorie | "all";

/**
 * State of the 3D face page: the list of parcours and its filter, the
 * parcours being browsed, the selected step, and whether the panel is open
 * on a phone (on a computer it is always visible).
 */
export function useParcoursExplorer() {
  const locale = useLocale() as Locale;
  const client = useMemo(() => createClient(), []);

  const [list, setList] = useState<ParcoursSummary[] | null>(null);
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [parcours, setParcours] = useState<ParcoursDetail | null>(null);
  const [selected, setSelected] = useState<number | null>(null); // step index
  // While the timer plays a two-sided step: the side being stimulated.
  const [side, setSide] = useState<Side | null>(null);
  const [error, setError] = useState(false);
  // On a phone the list is shown first; a session starts with it closed.
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getParcoursList(client, locale)
      .then((rows) => !cancelled && setList(rows))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [client, locale]);

  const select = useCallback((index: number | null, s: Side | null = null) => {
    setSelected(index);
    setSide(s);
  }, []);

  const open = useCallback(
    async (slug: string) => {
      setError(false);
      try {
        const detail = await getParcoursBySlug(client, slug, locale);
        setParcours(detail);
        select(detail && detail.etapes.length > 0 ? 0 : null);
        setPanelOpen(false);
      } catch {
        setError(true);
      }
    },
    [client, locale, select],
  );

  const close = useCallback(() => {
    setParcours(null);
    select(null);
    setPanelOpen(true);
  }, [select]);

  const togglePanel = useCallback(() => setPanelOpen((v) => !v), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  return {
    /** Null while loading. */
    list,
    /** The list, narrowed to the chosen category. */
    shown: (list ?? []).filter((p) => filter === "all" || p.categorie === filter),
    filter,
    setFilter,
    error,
    parcours,
    etapes: parcours?.etapes ?? [],
    selected,
    side,
    select,
    open,
    close,
    panelOpen,
    togglePanel,
    closePanel,
  };
}

export type ParcoursExplorerState = ReturnType<typeof useParcoursExplorer>;
