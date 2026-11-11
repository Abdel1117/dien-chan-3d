"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Wraps the header actions. On small screens they sit in a dropdown opened by
 * a burger button; from `sm` up they are displayed inline, as usual.
 */
export function MobileNav({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  // The menu is open only for the page it was opened on, so it closes by
  // itself after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpenOn(open ? null : pathname)}
        onKeyDown={(e) => e.key === "Escape" && setOpenOn(null)}
        className="-mr-2 rounded-md p-2 text-stone-800 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-stone-900 sm:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>
      <div
        id="site-menu"
        className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-full z-20 flex-col gap-4 border-b border-stone-200 bg-white px-4 py-4 shadow-md sm:static sm:z-auto sm:flex sm:flex-row sm:items-center sm:gap-5 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}
      >
        {children}
      </div>
    </>
  );
}
