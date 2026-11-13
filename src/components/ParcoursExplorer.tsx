"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeadViewerClient } from "@/three/HeadViewerClient";
import { useParcoursExplorer } from "./parcours/hooks/useParcoursExplorer";
import { useParcoursTimer } from "./parcours/hooks/useParcoursTimer";
import { MobileBar } from "./parcours/MobileBar";
import { ParcoursList } from "./parcours/ParcoursList";
import { SessionPanel } from "./parcours/SessionPanel";
import { chip } from "./parcours/styles";
import { cameraFocus, toViewerPoints } from "./parcours/viewerPoints";

/**
 * The 3D face page. On a computer: the face with a side panel (pick a
 * parcours, then browse its steps and run the timer). On a phone: the face
 * fills the screen, the session sits in a bar at the bottom, and the panel
 * slides up over the face when asked for.
 */
export function ParcoursExplorer() {
  const t = useTranslations("Explorer");
  const tv = useTranslations("Viewer");
  const explorer = useParcoursExplorer();
  const timer = useParcoursTimer(explorer.parcours, explorer.select);
  const { parcours, etapes, selected, side, panelOpen } = explorer;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1 lg:flex">
        <div className="absolute inset-0 lg:static lg:min-w-0 lg:flex-1">
          <div className="relative h-full">
            <HeadViewerClient
              focus={cameraFocus(selected !== null ? etapes[selected] : undefined, side)}
              points={toViewerPoints(etapes, selected, side)}
              selectedId={selected !== null ? etapes[selected]?.id : null}
              onSelectPoint={(id) => {
                const i = etapes.findIndex((e) => e.id === id.split(":")[0]);
                if (i >= 0) explorer.select(i);
              }}
            />
            <Link
              href="/"
              className={`${chip} absolute left-4 top-4 bg-white/90 text-stone-800 shadow hover:bg-white`}
            >
              {t("back")}
            </Link>
          </div>
        </div>

        {/* Phone: touching the face behind the open panel closes it. */}
        {panelOpen && (
          <button
            type="button"
            aria-label={t("closePanel")}
            onClick={explorer.closePanel}
            className="absolute inset-0 z-10 bg-stone-900/10 lg:hidden"
          />
        )}

        <aside
          id="explorer-panel"
          className={`absolute inset-x-0 bottom-0 z-20 max-h-[78%] overflow-y-auto rounded-t-2xl border-t border-stone-200 bg-white p-4 shadow-[0_-12px_32px_rgba(28,25,23,0.12)] transition-[translate,visibility] duration-300 motion-reduce:transition-none ${
            panelOpen ? "" : "invisible translate-y-full"
          } lg:visible lg:static lg:h-full lg:max-h-none lg:w-96 lg:flex-none lg:translate-y-0 lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-none`}
        >
          {parcours ? (
            <SessionPanel explorer={explorer} timer={timer} />
          ) : (
            <ParcoursList explorer={explorer} />
          )}
          <p className="mt-8 text-[10px] leading-tight text-stone-400">{tv("credit")}</p>
        </aside>
      </div>

      <MobileBar explorer={explorer} timer={timer} />
    </div>
  );
}
