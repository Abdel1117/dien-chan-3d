"use client";

import { useTranslations } from "next-intl";
import type { ParcoursExplorerState } from "./hooks/useParcoursExplorer";
import { chip } from "./styles";

const FILTERS = ["all", "douleur", "trouble"] as const;

/** The parcours to choose from, with the category filter. */
export function ParcoursList({ explorer }: { explorer: ParcoursExplorerState }) {
  const t = useTranslations("Explorer");
  const { list, shown, filter, setFilter, error, open } = explorer;

  return (
    <>
      <h1 className="text-lg font-semibold text-stone-900">{t("title")}</h1>
      <div role="group" aria-label={t("filter")} className="mt-3 flex gap-2">
        {FILTERS.map((f) => (
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

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {t("error")}
        </p>
      )}
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
  );
}
