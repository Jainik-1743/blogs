"use client";

import { FONT_LABELS, FONT_STEPS, type FontStep } from "@/lib/display";
import { useDisplay } from "@/lib/display-client";

const SIZES: Record<FontStep, string> = { s: "text-[0.8rem]", m: "text-[0.95rem]", l: "text-[1.1rem]", xl: "text-[1.3rem]" };

const THEME_LOOK = {
  dark: { bar: "#0b1120", card: "#111a2e", line: "#38bdf8" },
  light: { bar: "#f8fafc", card: "#ffffff", line: "#0284c7" },
} as const;

/** Theme and text size, at the top of the account page. The header buttons change the same two settings. */
export default function AppearanceCard() {
  const { theme, font, setTheme, setFont } = useDisplay();
  return (
    <section aria-labelledby="appearance-title" className="rounded-2xl border border-line bg-bg-elev p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="appearance-title" className="m-0 text-[1.1rem] font-bold text-ink">Appearance</h2>
        <p className="m-0 text-[0.85rem] text-ink-dim">Saved on this device.</p>
      </div>

      <div className="mt-5 grid gap-8 md:grid-cols-2">
        <div>
          <p className="m-0 mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-dim">Theme</p>
          <div className="grid grid-cols-2 gap-3" role="group" aria-label="Theme">
            {(["dark", "light"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTheme(t)} aria-pressed={theme === t} className={`rounded-xl border p-3 text-left transition ${theme === t ? "border-sky bg-sky-soft" : "border-line hover:border-sky"}`}>
                <span aria-hidden="true" className="mb-2.5 block h-14 rounded-lg border border-black/10 p-2" style={{ background: THEME_LOOK[t].bar }}>
                  <span className="block h-full rounded-md" style={{ background: THEME_LOOK[t].card, borderTop: `3px solid ${THEME_LOOK[t].line}` }} />
                </span>
                <span className={`flex items-center justify-between text-[0.9rem] font-semibold capitalize ${theme === t ? "text-sky" : "text-ink"}`}>
                  {t}
                  {theme === t && <span aria-hidden="true">✓</span>}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="m-0 mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-dim">Text size</p>
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Text size">
            {FONT_STEPS.map((step) => (
              <button key={step} type="button" onClick={() => setFont(step)} aria-pressed={font === step} title={FONT_LABELS[step]} className={`grid h-14 place-items-center rounded-xl border font-semibold transition ${font === step ? "border-sky bg-sky-soft text-sky" : "border-line text-ink hover:border-sky"}`}>
                <span aria-hidden="true" className={step === "s" ? "text-[0.85rem]" : step === "m" ? "text-[1.05rem]" : step === "l" ? "text-[1.3rem]" : "text-[1.6rem]"}>Aa</span>
                <span className="sr-only">{FONT_LABELS[step]}</span>
              </button>
            ))}
          </div>
          <p className={`mt-3 mb-0 rounded-lg border border-line bg-bg px-3.5 py-2.5 text-ink-dim ${SIZES[font]}`}>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.1em]">{FONT_LABELS[font]}</span>
            <span className="ml-3">A short preview of how lessons will read.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
