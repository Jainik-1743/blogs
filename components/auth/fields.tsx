"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-dim/60 outline-none transition focus:border-sky focus:ring-2 focus:ring-sky/30 disabled:opacity-60";

/** Label, control and either the error or a hint, wired together for screen readers. */
export function Field({ id, label, optional, error, hint, children }: { id: string; label: string; optional?: boolean; error?: string | null; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-[0.88rem] font-medium text-ink">
        <span>{label}</span>
        {optional && <span className="text-[0.75rem] font-normal text-ink-dim">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="mt-1.5 mb-0 text-[0.82rem] text-[#f87171]">{error}</p>
      ) : hint ? (
        <p id={`${id}-msg`} className="mt-1.5 mb-0 text-[0.8rem] text-ink-dim">{hint}</p>
      ) : null}
    </div>
  );
}

export function Notice({ tone, children }: { tone: "error" | "info" | "success"; children: ReactNode }) {
  const style =
    tone === "error" ? "border-[#f87171]/50 bg-[#f87171]/10 text-ink"
    : tone === "success" ? "border-sky/50 bg-sky-soft text-ink"
    : "border-line bg-bg text-ink-dim";
  return <p role={tone === "error" ? "alert" : "status"} className={`m-0 rounded-lg border px-4 py-3 text-[0.9rem] ${style}`}>{children}</p>;
}

export function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" width="18" height="18">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/**
 * A dropdown drawn by the site instead of the browser, so the box and the list match the design.
 * It is a button that opens a list of options; arrow keys, Home, End, Enter and Escape all work.
 */
export function SelectField({
  id, label, optional, value, onChange, disabled, options, placeholder,
}: { id: string; label: string; optional?: boolean; value: string; onChange: (v: string) => void; disabled?: boolean; options: readonly { value: string; label: string }[]; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const list = [{ value: "", label: placeholder }, ...options];
  const selected = list.findIndex((o) => o.value === value);
  const current = list[selected >= 0 ? selected : 0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function choose(i: number) {
    onChange(list[i].value);
    setOpen(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setActive(Math.max(selected, 0));
        return setOpen(true);
      }
      setActive((a) => Math.min(list.length - 1, Math.max(0, a + (e.key === "ArrowDown" ? 1 : -1))));
    } else if (e.key === "Home" && open) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End" && open) {
      e.preventDefault();
      setActive(list.length - 1);
    } else if ((e.key === "Enter" || e.key === " ") && open) {
      e.preventDefault();
      choose(active);
    }
  }

  return (
    <div>
      <label id={`${id}-label`} htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-[0.88rem] font-medium text-ink">
        <span>{label}</span>
        {optional && <span className="text-[0.75rem] font-normal text-ink-dim">Optional</span>}
      </label>
      <div ref={box} className="relative" onKeyDown={onKey}>
        <button
          id={id} type="button" disabled={disabled} role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`} aria-labelledby={`${id}-label`}
          onClick={() => { setActive(Math.max(selected, 0)); setOpen((o) => !o); }}
          className={`${inputClass} flex cursor-pointer items-center justify-between gap-3 pr-4 text-left ${open ? "!border-sky ring-2 ring-sky/30" : ""}`}
        >
          <span className={value ? "text-ink" : "text-ink-dim"}>{current.label}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-ink-dim transition-transform ${open ? "rotate-180" : ""}`}>
            <path d="M5 8l5 5 5-5" />
          </svg>
        </button>
        {open && (
          <ul id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} className="absolute inset-x-0 top-[calc(100%+0.4rem)] z-30 m-0 max-h-72 list-none overflow-auto rounded-xl border border-line bg-bg-elev p-1.5 shadow-2xl shadow-black/40">
            {list.map((o, i) => (
              <li
                key={o.value || "none"} role="option" aria-selected={i === selected}
                onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(i)}
                className={`m-0 flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-[0.93rem] ${i === active ? "bg-sky-soft text-ink" : "text-ink"} ${i === selected ? "font-semibold" : ""} ${!o.value ? "text-ink-dim" : ""}`}
              >
                <span>{o.label}</span>
                {i === selected && <span aria-hidden="true" className="text-sky">✓</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** An on/off switch with a label and a short explanation. */
export function Switch({ id, label, text, checked, onChange, disabled }: { id: string; label: string; text: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-5">
      <div>
        <label htmlFor={id} className="block cursor-pointer text-[0.95rem] font-medium text-ink">{label}</label>
        <p className="m-0 mt-0.5 text-[0.85rem] text-ink-dim">{text}</p>
      </div>
      <button id={id} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition ${checked ? "border-sky bg-sky" : "border-line bg-bg"} disabled:opacity-60`}>
        <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all ${checked ? "left-[1.35rem] bg-bg" : "left-0.5 bg-ink-dim"}`} style={{ height: "1.1rem", width: "1.1rem" }} />
      </button>
    </div>
  );
}
