"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { LOCALE_LABELS, routing, type Locale } from "@/i18n/routing";
import { HEAD_MODEL_VERSION } from "@/lib/model";
import { createClient } from "@/lib/supabase/client";
import { deletePoint, savePoint } from "@/lib/supabase/queries";
import type { PointRow, PointTraductionRow } from "@/lib/supabase/types";
import { HeadViewerClient } from "@/three/HeadViewerClient";
import type { SurfaceHit, Vec3, ViewerPoint } from "@/three/types";

type Texts = { nom: string; zone: string; description: string };
type Draft = {
  id?: string;
  numero: string;
  hit: SurfaceHit | null;
  texts: Record<Locale, Texts>;
};

const emptyTexts = (): Record<Locale, Texts> =>
  Object.fromEntries(
    routing.locales.map((l) => [l, { nom: "", zone: "", description: "" }]),
  ) as Record<Locale, Texts>;

const inputClass =
  "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-stone-900";
const buttonClass =
  "rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:opacity-50";

const vec = (x: number, y: number, z: number): Vec3 => [x, y, z];

/** Point numbers follow the Bùi Quốc Châu chart: sort 2 before 10. */
const byNumero = (a: PointRow, b: PointRow) =>
  a.numero.localeCompare(b.numero, undefined, { numeric: true });

export function PointEditor() {
  const t = useTranslations("PointEditor");
  const client = useMemo(() => createClient(), []);

  const [rows, setRows] = useState<PointRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Draft | null>(null);
  const [placing, setPlacing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const reload = useCallback(async () => {
    const [p, tr] = await Promise.all([
      client.from("points").select("*"),
      client.from("points_traductions").select("point_id, locale, nom"),
    ]);
    if (p.error) return setMessage({ ok: false, text: p.error.message });
    setRows(((p.data ?? []) as PointRow[]).sort(byNumero));
    const byPoint: Record<string, string> = {};
    for (const r of (tr.data ?? []) as Pick<PointTraductionRow, "point_id" | "locale" | "nom">[]) {
      if (r.locale === "fr" || !byPoint[r.point_id]) byPoint[r.point_id] = r.nom;
    }
    setNames(byPoint);
  }, [client]);

  useEffect(() => {
    // Initial load of the list from the database.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const viewerPoints: ViewerPoint[] = rows.map((r) => ({
    id: r.id,
    position: vec(r.pos_x, r.pos_y, r.pos_z),
    normal: vec(r.normal_x, r.normal_y, r.normal_z),
    obsolete: r.model_version !== HEAD_MODEL_VERSION,
  }));

  const draftMarker: ViewerPoint | null = draft?.hit
    ? { id: draft.id ?? "draft", position: draft.hit.position, normal: draft.hit.normal }
    : null;

  function startNew() {
    setMessage(null);
    setDraft({ numero: "", hit: null, texts: emptyTexts() });
    setPlacing(true);
  }

  async function select(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setMessage(null);
    setPlacing(false);
    const { data, error } = await client
      .from("points_traductions")
      .select("*")
      .eq("point_id", id);
    if (error) return setMessage({ ok: false, text: error.message });
    const texts = emptyTexts();
    for (const tr of (data ?? []) as PointTraductionRow[]) {
      texts[tr.locale] = {
        nom: tr.nom,
        zone: tr.zone ?? "",
        description: tr.description ?? "",
      };
    }
    setDraft({
      id,
      numero: row.numero,
      hit: {
        position: vec(row.pos_x, row.pos_y, row.pos_z),
        normal: vec(row.normal_x, row.normal_y, row.normal_z),
      },
      texts,
    });
  }

  function setText(locale: Locale, field: keyof Texts, value: string) {
    setDraft((d) =>
      d && { ...d, texts: { ...d.texts, [locale]: { ...d.texts[locale], [field]: value } } },
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const fail = (text: string) => setMessage({ ok: false, text });
    if (!draft.numero.trim()) return fail(t("errNumero"));
    if (!draft.texts.fr.nom.trim()) return fail(t("errNom"));
    if (!draft.hit) return fail(t("errPosition"));

    setBusy(true);
    setMessage(null);
    try {
      const translations: Parameters<typeof savePoint>[1]["translations"] = {};
      for (const l of routing.locales) {
        const x = draft.texts[l];
        if (x.nom.trim()) {
          translations[l] = {
            nom: x.nom.trim(),
            zone: x.zone.trim() || null,
            description: x.description.trim() || null,
          };
        }
      }
      const id = await savePoint(client, {
        id: draft.id,
        numero: draft.numero.trim(),
        position: { x: draft.hit.position[0], y: draft.hit.position[1], z: draft.hit.position[2] },
        normal: { x: draft.hit.normal[0], y: draft.hit.normal[1], z: draft.hit.normal[2] },
        modelVersion: HEAD_MODEL_VERSION,
        translations,
      });
      await reload();
      setDraft((d) => d && { ...d, id });
      setPlacing(false);
      setMessage({ ok: true, text: t("saved") });
    } catch (e) {
      const text = e instanceof Error ? e.message : "";
      // unique (model_version, numero)
      setMessage({ ok: false, text: /duplicate|unique/i.test(text) ? t("errDuplicate") : text || t("errSave") });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!draft?.id || !window.confirm(t("confirmDelete"))) return;
    setBusy(true);
    try {
      await deletePoint(client, draft.id);
      setDraft(null);
      setPlacing(false);
      await reload();
      setMessage({ ok: true, text: t("deleted") });
    } catch (e) {
      // A point used by a parcours cannot be deleted.
      setMessage({ ok: false, text: t("errDelete") + (e instanceof Error ? ` (${e.message})` : "") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-57px)] flex-col lg:flex-row">
      <div className="h-[45%] min-h-0 flex-none lg:h-full lg:flex-1">
        <HeadViewerClient
          points={viewerPoints}
          selectedId={draft?.id ?? null}
          draft={draftMarker}
          onSelectPoint={placing ? undefined : select}
          onPickSurface={
            placing
              ? (hit) => {
                  setDraft((d) => d && { ...d, hit });
                  setPlacing(false);
                }
              : undefined
          }
        />
      </div>

      <aside className="min-h-0 flex-1 overflow-y-auto border-t border-stone-200 bg-white p-4 lg:w-[26rem] lg:flex-none lg:border-l lg:border-t-0">
        {!draft ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-lg font-semibold text-stone-900">{t("title")}</h1>
              <button type="button" onClick={startNew} className={`${buttonClass} bg-stone-900 text-white hover:bg-stone-700`}>
                {t("newPoint")}
              </button>
            </div>
            <p className="mt-2 text-sm text-stone-600">{t("selectHint")}</p>
            {message && (
              <p role="status" className={`mt-3 text-sm ${message.ok ? "text-emerald-700" : "text-red-700"}`}>
                {message.text}
              </p>
            )}
            {rows.length === 0 ? (
              <p className="mt-6 text-sm text-stone-500">{t("empty")}</p>
            ) : (
              <ul className="mt-4 divide-y divide-stone-100">
                {rows.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => select(r.id)}
                      className="flex w-full items-baseline gap-3 py-2 text-left text-sm hover:bg-stone-50"
                    >
                      <span className="w-12 shrink-0 font-mono font-medium text-stone-900">{r.numero}</span>
                      <span className="min-w-0 flex-1 truncate text-stone-700">{names[r.id] ?? ""}</span>
                      {r.model_version !== HEAD_MODEL_VERSION && (
                        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500">{t("obsolete")}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-stone-900">
                {draft.id ? t("editPoint") : t("newPoint")}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setDraft(null);
                  setPlacing(false);
                  setMessage(null);
                }}
                className={`${buttonClass} border border-stone-300 text-stone-700 hover:bg-stone-100`}
              >
                {t("close")}
              </button>
            </div>

            <div>
              <label htmlFor="numero" className="text-sm font-medium text-stone-800">{t("numero")}</label>
              <input
                id="numero"
                value={draft.numero}
                onChange={(e) => setDraft({ ...draft, numero: e.target.value })}
                className={inputClass}
                placeholder="26"
              />
              <p className="mt-1 text-xs text-stone-500">{t("numeroHint")}</p>
            </div>

            <div className="rounded-lg bg-stone-50 p-3 text-sm">
              {placing ? (
                <p className="font-medium text-teal-800">{t("placeHint")}</p>
              ) : (
                <p className="text-stone-700">{draft.hit ? t("positionSet") : t("noPosition")}</p>
              )}
              <button
                type="button"
                onClick={() => setPlacing((v) => !v)}
                className={`${buttonClass} mt-2 border border-stone-300 text-stone-800 hover:bg-white`}
              >
                {placing ? t("cancelPlace") : draft.hit ? t("movePoint") : t("placePoint")}
              </button>
            </div>

            {routing.locales.map((l) => (
              <fieldset key={l} className="space-y-2 rounded-lg border border-stone-200 p-3">
                <legend className="px-1 text-sm font-medium text-stone-800">{LOCALE_LABELS[l]}</legend>
                <label className="block text-xs text-stone-600">
                  {t("nom")}{l === "fr" && " *"}
                  <input value={draft.texts[l].nom} onChange={(e) => setText(l, "nom", e.target.value)} className={inputClass} />
                </label>
                <label className="block text-xs text-stone-600">
                  {t("zone")}
                  <input value={draft.texts[l].zone} onChange={(e) => setText(l, "zone", e.target.value)} className={inputClass} />
                </label>
                <label className="block text-xs text-stone-600">
                  {t("description")}
                  <textarea rows={2} value={draft.texts[l].description} onChange={(e) => setText(l, "description", e.target.value)} className={inputClass} />
                </label>
              </fieldset>
            ))}

            {message && (
              <p role="alert" className={`text-sm ${message.ok ? "text-emerald-700" : "text-red-700"}`}>
                {message.text}
              </p>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={busy} className={`${buttonClass} bg-stone-900 text-white hover:bg-stone-700`}>
                {busy ? t("saving") : t("save")}
              </button>
              {draft.id && (
                <button type="button" disabled={busy} onClick={onDelete} className={`${buttonClass} border border-red-300 text-red-700 hover:bg-red-50`}>
                  {t("delete")}
                </button>
              )}
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
