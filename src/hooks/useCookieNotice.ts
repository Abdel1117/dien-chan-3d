"use client";

import { useCallback, useSyncExternalStore } from "react";

// Remembered in the browser only: this is not a cookie and is never sent.
const KEY = "cookie-notice-dismissed";
const CHANGE = "cookie-notice-change";

function subscribe(notify: () => void) {
  window.addEventListener(CHANGE, notify);
  window.addEventListener("storage", notify); // closed in another tab
  return () => {
    window.removeEventListener(CHANGE, notify);
    window.removeEventListener("storage", notify);
  };
}

function isDismissed() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false; // storage blocked: the notice is shown on each visit
  }
}

/**
 * Whether the cookie notice must be shown, and how to close it for good.
 * It stays hidden on the server and until the browser has been asked.
 */
export function useCookieNotice() {
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      // Nothing to remember it with: it will come back on the next page.
    }
    window.dispatchEvent(new Event(CHANGE));
  }, []);

  return { visible: !dismissed, dismiss };
}
