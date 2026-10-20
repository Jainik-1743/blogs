"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "@/components/auth/AuthProvider";
import { track } from "@/lib/analytics";
import { useToast } from "@/components/Toast";

/** A darker version of each accent, so the download reads well on white paper. */
const INK: Record<string, string> = {
  indigo: "#4338ca", lime: "#4d7c0f", emerald: "#047857", pink: "#be185d", amber: "#b45309",
  sky: "#0369a1", violet: "#6d28d9", teal: "#0f766e", orange: "#c2410c", rose: "#be123c",
};
const PAPER = { "--color-bg": "#ffffff", "--color-bg-elev": "#f8fafc", "--color-bg-code": "#eef2f7", "--color-line": "#dbe3ec", "--color-ink": "#0f172a", "--color-ink-dim": "#475569" };
const WIDTH = 1200;

/** Copies the sheet into an off-screen, always-light page so downloads look the same in every theme. */
async function render(accent: string, kind: "png" | "jpeg"): Promise<{ url: string; width: number; height: number }> {
  const source = document.getElementById("sheet-poster");
  if (!source) throw new Error("The sheet is not on the page");
  const { toJpeg, toPng } = await import("html-to-image");
  const stage = document.createElement("div");
  Object.assign(stage.style, { position: "fixed", left: "-20000px", top: "0", width: `${WIDTH}px`, background: "#ffffff" });
  for (const [k, v] of Object.entries({ ...PAPER, "--color-sky": INK[accent] ?? INK.sky })) stage.style.setProperty(k, v);
  stage.setAttribute("data-theme", "light");
  // The page's web fonts are not embedded in the picture, so name fonts every computer has instead of falling back to a serif.
  stage.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const fonts = document.createElement("style");
  fonts.textContent = '[data-export-stage] code, [data-export-stage] .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace !important; }';
  stage.setAttribute("data-export-stage", "");
  stage.appendChild(fonts);
  const copy = source.cloneNode(true) as HTMLElement;
  copy.style.border = "0";
  copy.style.padding = "28px";
  copy.removeAttribute("id");
  // A small footer so a shared picture still says where it came from.
  const foot = document.createElement("p");
  foot.textContent = `Free lessons and cheat sheets at ${location.host}`;
  Object.assign(foot.style, { margin: "8px 0 0", fontSize: "12px", color: "#475569", textAlign: "right" });
  copy.appendChild(foot);
  stage.appendChild(copy);
  document.body.appendChild(stage);
  try {
    // Let the browser lay the columns out before the picture is taken.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const height = copy.offsetHeight;
    const opts = { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: false, skipFonts: true, width: WIDTH, height };
    const url = kind === "png" ? await toPng(copy, opts) : await toJpeg(copy, { ...opts, quality: 0.95 });
    return { url, width: WIDTH, height };
  } finally {
    stage.remove();
  }
}

const slugOfPage = () => location.pathname.split("/").filter(Boolean).pop() ?? "cheat-sheet";

/**
 * PNG and PDF downloads. Both are made in the reader's browser, so they cost nothing to serve.
 * Downloading is for signed-in readers; everyone can read the sheet on the page.
 */
export default function DownloadBar({ slug, accent }: { slug: string; accent: string }) {
  const { status } = useAccount();
  const toast = useToast();
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);

  async function download(format: "png" | "pdf") {
    setBusy(format);
    try {
      const name = `${slug || slugOfPage()}-cheat-sheet`;
      if (format === "png") {
        const { url } = await render(accent, "png");
        save(url, `${name}.png`);
      } else {
        const [{ url, width, height }, { jsPDF }] = await Promise.all([render(accent, "jpeg"), import("jspdf")]);
        // One page as wide as A4, as tall as the sheet needs: nothing is cut in the middle of a card.
        const w = 210;
        const h = Math.max(120, (w * height) / width);
        const pdf = new jsPDF({ unit: "mm", format: [w, h], orientation: h > w ? "portrait" : "landscape" });
        pdf.addImage(url, "JPEG", 0, 0, w, h);
        pdf.save(`${name}.pdf`);
      }
      track("cheatsheet_downloaded", { slug, format });
      toast(`Downloaded ${format.toUpperCase()}.`);
    } catch (err) {
      console.error("Cheat sheet download failed:", err);
      toast("The download could not be made. Please try again.", "error");
    } finally {
      setBusy(null);
    }
  }

  if (status === "loading") return <div className="mb-6 h-11" aria-hidden="true" />;

  if (status !== "ready") {
    return (
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-bg-elev px-5 py-4" data-no-glossary>
        <p className="m-0 flex-1 basis-64 text-ink-dim"><strong className="text-ink">Download this sheet as a PNG or PDF.</strong> It is free with an account. Reading it here is always free.</p>
        <div className="flex gap-2">
          <Link href={`/login?next=${encodeURIComponent(`/cheatsheets/${slug}`)}`} className="rounded-lg bg-sky px-4 py-2 text-[0.9rem] font-semibold text-bg hover:no-underline hover:brightness-110">Sign in</Link>
          <Link href={`/signup?next=${encodeURIComponent(`/cheatsheets/${slug}`)}`} className="rounded-lg border border-line px-4 py-2 text-[0.9rem] font-semibold text-ink hover:border-sky hover:text-sky hover:no-underline">Create account</Link>
        </div>
      </div>
    );
  }

  const btn = "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-[0.9rem] font-semibold transition disabled:cursor-wait disabled:opacity-60";
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3" data-no-glossary>
      <button type="button" disabled={busy !== null} onClick={() => void download("png")} className={`${btn} border-sky bg-sky text-bg hover:brightness-110`}>{busy === "png" ? "Making PNG…" : "Download PNG"}</button>
      <button type="button" disabled={busy !== null} onClick={() => void download("pdf")} className={`${btn} border-sky text-sky hover:bg-sky-soft`}>{busy === "pdf" ? "Making PDF…" : "Download PDF"}</button>
      <span className="text-[0.82rem] text-ink-dim">Made on your device. Light colours for printing.</span>
    </div>
  );
}

function save(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
