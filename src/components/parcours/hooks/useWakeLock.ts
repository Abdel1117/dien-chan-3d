"use client";

import { useEffect } from "react";

/** Keeps the screen on while `active` is true (where the browser supports it). */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = () =>
      navigator.wakeLock
        .request("screen")
        .then((l) => (cancelled ? void l.release() : (lock = l)))
        .catch(() => {});
    // The lock is dropped when the tab is hidden: take it again on return.
    const onVisible = () => document.visibilityState === "visible" && acquire();
    void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, [active]);
}
