"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type Tone = "success" | "error" | "info";
type Item = { id: number; text: string; tone: Tone };

const ToastContext = createContext<(text: string, tone?: Tone) => void>(() => undefined);

/** Shows a short message in the top-right corner. Use it for anything that was saved, sent or went wrong. */
export const useToast = () => useContext(ToastContext);

const ICON: Record<Tone, string> = { success: "✓", error: "!", info: "i" };
const RING: Record<Tone, string> = { success: "bg-sky text-bg", error: "bg-[#ef4444] text-white", info: "bg-ink-dim text-bg" };

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const show = useCallback((text: string, tone: Tone = "success") => {
    const id = nextId.current++;
    setItems((l) => [...l.slice(-3), { id, text, tone }]);
    window.setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4000);
  }, [dismiss]);

  const value = useMemo(() => show, [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 top-20 z-50 flex flex-col items-end gap-2 sm:left-auto sm:right-6" data-no-glossary>
        {items.map((t) => (
          <div key={t.id} role={t.tone === "error" ? "alert" : "status"} className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-bg-elev px-4 py-3 shadow-2xl shadow-black/40">
            <span aria-hidden="true" className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold ${RING[t.tone]}`}>{ICON[t.tone]}</span>
            <p className="m-0 flex-1 text-[0.9rem] leading-snug text-ink">{t.text}</p>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-ink-dim hover:text-ink">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
