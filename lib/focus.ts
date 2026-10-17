import { useSyncExternalStore } from "react";

/**
 * Focus mode is a plain on/off switch kept in memory: it is not saved anywhere, so a reload turns it
 * off. <FocusMode> in the layout applies it to the page and shows the "Exit" button.
 */
let on = false;
const listeners = new Set<() => void>();

export function setFocus(next: boolean) {
  if (on === next) return;
  on = next;
  for (const l of listeners) l();
}

export const toggleFocus = () => setFocus(!on);

export function useFocus(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => on,
    () => false,
  );
}
