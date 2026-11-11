"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import {
  getParcoursBySlug,
  getParcoursList,
  type Etape,
  type ParcoursDetail,
  type ParcoursSummary,
} from "@/lib/supabase/queries";
import type { Side } from "@/lib/minutage/sequence";
import type { Categorie } from "@/lib/supabase/types";
import { ParcoursPlayer } from "./ParcoursPlayer";
import { HeadViewerClient } from "@/three/HeadViewerClient";
import type { ViewerPoint } from "@/three/types";

type Filter = Categorie | "all";

const chip =
  "rounded-full px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900";

/** The 3D face with a side panel: pick a parcours, then browse its steps. */
export function ParcoursExplorer() {
  const t = useTranslations("Explorer");
  const tv = useTranslations("Viewer");
  const locale = useLocale() as Locale;
  const client = useMemo(() => createClient(), []);

  const [list, setList] = useState<ParcoursSummary[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [parcours, setParcours] = useState<ParcoursDetail | null>(null);
  const [selected, setSelected] = useState<number | null>(null); // step index
  // While the timer plays a two-sided step: the side being stimulated.
  const [side, setSide] = useState<Side | null>(null);
  const select = useCallback((index: number | null, s: Side | null = null) => {
    setSelected(index);
    setSide(s);
  }, []);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getParcoursList(client, locale)
      .then((rows) => !cancelled && setList(rows))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [client, locale]);

  async function open(slug: string) {
    setError(false);
    try {
      const detail = await getParcoursBySlug(client, slug, locale);
      setParcours(detail);
      select(detail && detail.etapes.length > 0 ? 0 : null);
    } catch {
      setError(true);
    }
  }

  const etapes = parcours?.etapes ?? [];
  // A point is drawn where it was placed. A step on both sides also gets the
  // mirror image across the face's vertical midline (x = 0).
  // A point is drawn where it was placed. A step on both sides also gets the
  // mirror image across the face's vertical midline (x = 0). The person's left
  // is +X. Colours: red = current, orange = next, teal = the rest.
  const currentStep = selected !== null ? etapes[selected] : undefined;
  const nextStepId = selected !== null ? etapes[selected + 1]?.id : undefined;
  const viewerPoints: ViewerPoint[] = etapes.flatMap((e) => {
    const { pos_x, pos_y, pos_z, normal_x, normal_y, normal_z } = e.point;
    const marker = (mirror: boolean): ViewerPoint => {
      const x = mirror ? -pos_x : pos_x;
      const markerSide: Side = x >= 0 ? "gauche" : "droite";
      // Played one side at a time: only that side is current, and the other
      // side is what comes next while the left one is being done.
      const split = e.id === currentStep?.id && side !== null && e.cote === "les_deux";
      const waitingForOtherSide = currentStep?.cote === "les_deux" && side === "gauche";
      return {
        id: mirror ? `${e.id}:mirror` : e.id,
        group: split && markerSide !== side ? `${e.id}:other` : e.id,
        next: split
          ? side === "gauche" && markerSide === "droite"
          : e.id === nextStepId && !waitingForOtherSide,
        position: [x, pos_y, pos_z],
        normal: [mirror ? -normal_x : normal_x, normal_y, normal_z],
      };
    };
    return e.cote === "les_deux" ? [marker(false), marker(true)] : [marker(false)];
  });

  // Camera target: the current point. A two-sided step is viewed from the
  // front unless the timer is on one side, then the camera turns to that side.
  let focus: [number, number, number] | null = null;
  if (currentStep) {
    const { pos_x, pos_y, pos_z } = currentStep.point;
    const x =
      currentStep.cote !== "les_deux"
        ? pos_x
        : side === null
          ? 0
          : Math.abs(pos_x) * (side === "gauche" ? 1 : -1);
    focus = [x, pos_y, pos_z];
  }

  const shown = (list ?? []).filter((p) => filter === "all" || p.categorie === filter);

  function dosage(e: Etape) {
    const amount =
      e.mode_dosage === "duree"
        ? t("seconds", { n: e.duree_secondes ?? 0 })
        : t("reps", { n: e.repetitions ?? 0 });
    return e.cote === "les_deux" ? t("perSide", { amount }) : amount;
  }

  return (
    <div className="flex h-dvh flex-col lg:flex-row">
      <div className="relative h-[45%] min-h-0 flex-none lg:h-full lg:flex-1">
        <HeadViewerClient
          focus={focus}
          points={viewerPoints}
          selectedId={selected !== null ? etapes[selected]?.id : null}
          onSelectPoint={(id) => {
            const i = etapes.findIndex((e) => e.id === id.split(":")[0]);
            if (i >= 0) select(i);
          }}
        />
        <Link
          href="/"
          className={`${chip} absolute left-4 top-4 bg-white/90 text-stone-800 shadow hover:bg-white`}
        >
          {t("back")}
        </Link>
      </div>

      <aside className="min-h-0 flex-1 overflow-y-auto border-t border-stone-200 bg-white p-4 lg:w-96 lg:flex-none lg:border-l lg:border-t-0">
        {!parcours ? (
          <>
            <h1 className="text-lg font-semibold text-stone-900">{t("title")}</h1>
            <div role="group" aria-label={t("filter")} className="mt-3 flex gap-2">
              {(["all", "douleur", "trouble"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`${chip} ${filter === f ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
                >
                  {t(`filter_${f}`)}
                </button>
              ))}
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-red-700">{t("error")}</p>}
            {list === null && !error && <p className="mt-4 text-sm text-stone-500">{t("loading")}</p>}
            {list !== null && shown.length === 0 && (
              <p className="mt-4 text-sm text-stone-500">{t("empty")}</p>
            )}
            <ul className="mt-4 space-y-2">
              {shown.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => open(p.slug)}
                    className="w-full rounded-xl border border-stone-200 p-3 text-left hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
                  >
                    <span className="block text-xs uppercase tracking-wide text-stone-500">
                      {t(`filter_${p.categorie}`)}
                    </span>
                    <span className="mt-0.5 block font-medium text-stone-900">{p.titre}</span>
                    {p.description && (
                      <span className="mt-1 block text-sm text-stone-600">{p.description}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setParcours(null);
                select(null);
              }}
              className="text-sm text-stone-600 underline hover:text-stone-900"
            >
              {t("allParcours")}
            </button>
            <h1 className="mt-2 text-lg font-semibold text-stone-900">{parcours.titre}</h1>
            {parcours.description && (
              <p className="mt-1 text-sm text-stone-600">{parcours.description}</p>
            )}
            <p className="mt-2 text-sm text-stone-500">
              {t("stepCount", { n: etapes.length })} · {t("tours", { n: parcours.tours })}
            </p>

            <ParcoursPlayer key={parcours.id} parcours={parcours} onStep={select} />

            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600">
              <span><span aria-hidden="true" className="mr-1 inline-block size-2.5 rounded-full bg-red-600" />{t("legendCurrent")}</span>
              <span><span aria-hidden="true" className="mr-1 inline-block size-2.5 rounded-full bg-amber-500" />{t("legendNext")}</span>
              <span><span aria-hidden="true" className="mr-1 inline-block size-2.5 rounded-full bg-teal-600" />{t("legendOther")}</span>
            </p>

            <ol className="mt-4 space-y-2">
              {etapes.map((e, i) => (
                <li key={e.id}>
                  <button
                    type="button"
                    aria-current={selected === i}
                    onClick={() => select(i)}
                    className={`w-full rounded-xl border p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${
                      selected === i ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-sm font-medium text-stone-900">{e.point.numero}</span>
                      <span className="min-w-0 flex-1 truncate font-medium text-stone-900">{e.point.nom}</span>
                      <span className="shrink-0 text-sm text-stone-600">{dosage(e)}</span>
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

            {parcours.avertissement && (
              <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                <strong>{t("warning")} </strong>
                {parcours.avertissement}
              </p>
            )}
          </>
        )}
        <p className="mt-8 text-[10px] leading-tight text-stone-400">{tv("credit")}</p>
      </aside>
    </div>
  );
}
