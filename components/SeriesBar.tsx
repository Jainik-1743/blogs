"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ACCENTS, ACCENT_NAMES, accentStorageKey, type SeriesNavItem } from "@/lib/accents";

function readSaved(series: string): string | null {
  try {
    const v = localStorage.getItem(accentStorageKey(series));
    return v && ACCENT_NAMES.includes(v) ? v : null;
  } catch {
    return null;
  }
}

function applyReaderAccent(value: string | null) {
  const root = document.documentElement;
  if (value) root.setAttribute("data-reader-accent", value);
  else root.removeAttribute("data-reader-accent");
}

/**
 * The right-hand side of the header. Outside a series it renders nothing. Inside one it
 * shows the series name (a way back to its contents) and a swatch menu that lets the
 * reader recolour that series. The pick is saved per series, so System Design can stay
 * orange while DevOps turns teal.
 */
export default function SeriesBar({ series }: { series: SeriesNavItem[] }) {
  const pathname = usePathname();
  const current = series.find((s) => s.slug === pathname.split("/")[1]) ?? null;
  const [picked, setPicked] = useState<string | null>(null);

  // Keep <html data-reader-accent> in step with the series being read. The inline script in
  // app/layout.tsx does this on a full load; this covers client-side navigation.
  const slug = current?.slug ?? null;
  useEffect(() => {
    const saved = slug ? readSaved(slug) : null;
    setPicked(saved);
    applyReaderAccent(saved);
  }, [slug]);

  const choose = useCallback(
    (name: string | null) => {
      if (!slug) return;
      try {
        if (name) localStorage.setItem(accentStorageKey(slug), name);
        else localStorage.removeItem(accentStorageKey(slug));
      } catch {
        /* Storage blocked: the colour still applies for this visit. */
      }
      setPicked(name);
      applyReaderAccent(name);
    },
    [slug],
  );

  if (!current) return null;

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <Link
        href={`/${current.slug}`}
        className="min-w-0 truncate rounded-full border border-line bg-bg-elev px-3 py-1 text-[0.85rem] font-medium text-ink-dim transition-colors hover:border-sky hover:text-sky hover:no-underline max-sm:max-w-[9.5rem]"
        title={`${current.title} — contents`}
      >
        {current.title}
      </Link>
      <AccentMenu active={picked ?? current.accent} seriesDefault={current.accent} onChoose={choose} />
    </div>
  );
}

function AccentMenu({
  active,
  seriesDefault,
  onChoose,
}: {
  active: string;
  seriesDefault: string;
  onChoose: (name: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    // Focus the selected swatch so arrow keys start from it.
    wrap.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onGridKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 5, ArrowLeft: -1, ArrowUp: -5 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]"));
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    items[(i + keys[e.key] + items.length) % items.length]?.focus();
  };

  const activeLabel = ACCENTS.find((a) => a.name === active)?.label ?? active;

  return (
    <div ref={wrap} className="relative">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Accent colour: ${activeLabel}. Change colour`}
        className="flex h-8 items-center gap-2 rounded-full border border-line bg-bg-elev pl-1.5 pr-2.5 text-[0.8rem] text-ink-dim transition-colors hover:border-sky hover:text-ink"
      >
        <span className="h-5 w-5 rounded-full bg-gradient-to-br from-sky-strong to-sky ring-2 ring-bg" />
        <span className="max-sm:hidden">Colour</span>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[15.5rem] rounded-2xl border border-line bg-bg-elev p-4 shadow-2xl shadow-black/50"
        >
          <p className="m-0 mb-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-dim">
            Accent colour
          </p>
          <div
            role="radiogroup"
            aria-label="Accent colour"
            className="grid grid-cols-5 gap-2.5"
            onKeyDown={onGridKey}
          >
            {ACCENTS.map((a) => {
              const selected = a.name === active;
              return (
                <button
                  key={a.name}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  title={a.name === seriesDefault ? `${a.label} (series default)` : a.label}
                  aria-label={a.name === seriesDefault ? `${a.label}, series default` : a.label}
                  data-accent={a.name}
                  onClick={() => onChoose(a.name === seriesDefault ? null : a.name)}
                  className={`relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-sky-strong to-sky transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    selected ? "ring-2 ring-ink ring-offset-2 ring-offset-bg-elev" : ""
                  }`}
                >
                  {selected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                      <path d="M3 7.2 5.8 10 11 4.5" stroke="#0b1120" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {a.name === seriesDefault && !selected && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-elev bg-ink" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3 text-[0.8rem]">
            <span className="text-ink">{activeLabel}</span>
            <button
              type="button"
              onClick={() => onChoose(null)}
              disabled={active === seriesDefault}
              className="text-sky hover:text-sky-strong disabled:cursor-default disabled:text-ink-dim/60"
            >
              Reset to default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
