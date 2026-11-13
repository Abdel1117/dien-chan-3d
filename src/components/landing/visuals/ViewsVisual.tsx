import Image from "next/image";
import { useTranslations } from "next-intl";
import { visualFrame } from "../styles";

// Renders of the real head (public/landing), on the frame's own grey.
const VIEWS = [
  { file: "left", labelKey: "viewLeft" },
  { file: "face", labelKey: "viewFace" },
  { file: "right", labelKey: "viewRight" },
] as const;
const INITIAL = 1; // the front view

/** Step 1: the head seen from the views offered under the 3D face. */
export function ViewsVisual() {
  const t = useTranslations("Viewer");

  return (
    <div data-visual aria-hidden="true" className={`${visualFrame} bg-[#f5f5f4]`}>
      {VIEWS.map(({ file }, i) => (
        <Image
          key={file}
          data-view-img
          src={`/landing/head-${file}.webp`}
          alt=""
          fill
          sizes="(min-width: 768px) 320px, 100vw"
          className={`object-contain pb-12 pt-4 ${i === INITIAL ? "" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
        {VIEWS.map(({ file, labelKey }, i) => (
          <span
            key={file}
            data-view-pill
            data-active={i === INITIAL}
            className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-stone-700 shadow-sm transition-colors duration-300 data-[active=true]:bg-stone-900 data-[active=true]:text-white"
          >
            {t(labelKey)}
          </span>
        ))}
      </div>
    </div>
  );
}
