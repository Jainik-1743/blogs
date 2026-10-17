"use client";

import { useState } from "react";
import type { RoadmapStage } from "@/lib/roadmap";

type Props = { stages: RoadmapStage[]; siteUrl: string };

const ACCENT_HEX: Record<string, string> = {
  sky: "#38bdf8", indigo: "#818cf8", violet: "#a78bfa", pink: "#f472b6", rose: "#fb7185",
  orange: "#fb923c", amber: "#fbbf24", lime: "#a3e635", emerald: "#34d399", teal: "#2dd4bf",
};
const ACCENT_HEX_LIGHT: Record<string, string> = {
  sky: "#0284c7", indigo: "#4f46e5", violet: "#7c3aed", pink: "#db2777", rose: "#e11d48",
  orange: "#ea580c", amber: "#b45309", lime: "#4d7c0f", emerald: "#059669", teal: "#0d9488",
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const FONT = "Inter, system-ui, -apple-system, Segoe UI, Arial, sans-serif";

/** Builds the roadmap as one standalone SVG. Every card links to its series on the live site. */
function buildSvg({ stages, siteUrl }: Props, light: boolean): { svg: string; width: number; height: number } {
  const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const bg = light ? "#f8fafc" : "#0b1120";
  const cardBg = light ? "#ffffff" : "#111a2e";
  const ink = light ? "#0f172a" : "#e2e8f0";
  const dim = light ? "#475569" : "#94a3b8";
  const line = light ? "#cbd5e1" : "#1e293b";
  const accents = light ? ACCENT_HEX_LIGHT : ACCENT_HEX;

  const M = 40, CW = 236, CH = 48, GAP = 12, GUT = 70, NW = 248, NH = 78, STAGE_GAP = 40;
  const W = M * 2 + CW * 2 + GUT * 2 + NW;
  const cx = W / 2;
  const leftX = M, rightX = W - M - CW;
  let y = 150;
  const out: string[] = [];
  const lines: string[] = [];
  const nodes: string[] = [];
  let prevBottom = 142;

  for (const s of stages) {
    const col = accents[s.accent] ?? accents.sky;
    const n = Math.max(s.left.length, s.right.length, 1);
    const h = Math.max(n * CH + (n - 1) * GAP, NH);
    const mid = y + h / 2;
    const url = (href: string) => esc(siteUrl.replace(/\/$/, "") + href);

    // Spine line from the previous step to this one.
    lines.push(`<line x1="${cx}" y1="${prevBottom}" x2="${cx}" y2="${mid - NH / 2}" stroke="${col}" stroke-width="3" stroke-opacity="0.6"/>`);

    const side = (cards: typeof s.left, isLeft: boolean) => {
      if (!cards.length) return;
      const total = cards.length * CH + (cards.length - 1) * GAP;
      const top = mid - total / 2;
      const edge = isLeft ? leftX + CW : rightX;
      const bracketX = isLeft ? cx - NW / 2 - GUT / 2 : cx + NW / 2 + GUT / 2;
      const nodeEdge = isLeft ? cx - NW / 2 : cx + NW / 2;
      const ys = cards.map((_, i) => top + i * (CH + GAP) + CH / 2);
      lines.push(`<path d="M${bracketX} ${ys[0]} V${ys[ys.length - 1]} M${bracketX} ${mid} H${nodeEdge}" stroke="${col}" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round" fill="none"/>`);
      cards.forEach((c, i) => {
        const cy = top + i * (CH + GAP);
        const x = isLeft ? leftX : rightX;
        lines.push(`<path d="M${edge} ${ys[i]} H${bracketX}" stroke="${col}" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round" fill="none"/>`);
        const label = c.label.length > 32 ? c.label.slice(0, 31) + "…" : c.label;
        const fs = label.length > 24 ? 13.5 : 15;
        nodes.push(
          `<a href="${url(c.href)}"><rect x="${x}" y="${cy}" width="${CW}" height="${CH}" rx="10" fill="${cardBg}" stroke="${accents[c.accent] ?? col}" stroke-width="2"/>` +
            `<text x="${x + CW / 2}" y="${cy + 21}" text-anchor="middle" font-family="${FONT}" font-size="${fs}" font-weight="600" fill="${ink}">${esc(label)}</text>` +
            `<text x="${x + CW / 2}" y="${cy + 38}" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${dim}">${c.lessons} lessons</text></a>`,
        );
      });
    };
    side(s.left, true);
    side(s.right, false);

    const label = s.title.length > 24 ? s.title.slice(0, 23) + "…" : s.title;
    nodes.push(
      `<a href="${url(s.spine.href)}"><rect x="${cx - NW / 2}" y="${mid - NH / 2}" width="${NW}" height="${NH}" rx="14" fill="${col}"/>` +
        `<text x="${cx}" y="${mid - 14}" text-anchor="middle" font-family="${FONT}" font-size="11" letter-spacing="1.5" fill="${light ? "#ffffff" : "#0b1120"}" fill-opacity="0.75">STEP ${s.step}</text>` +
        `<text x="${cx}" y="${mid + 7}" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="700" fill="${light ? "#ffffff" : "#0b1120"}">${esc(label)}</text>` +
        `<text x="${cx}" y="${mid + 25}" text-anchor="middle" font-family="${FONT}" font-size="12" fill="${light ? "#ffffff" : "#0b1120"}" fill-opacity="0.85">${esc(s.spine.label)}, ${s.spine.lessons} lessons</text></a>`,
    );
    prevBottom = mid + NH / 2;
    y += h + STAGE_GAP;
  }

  const H = y + 70;
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  out.push(`<rect width="${W}" height="${H}" fill="${bg}"/>`);
  out.push(`<text x="${cx}" y="66" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="800" fill="${accents.sky}">Developer Roadmap</text>`);
  out.push(`<text x="${cx}" y="98" text-anchor="middle" font-family="${FONT}" font-size="15" fill="${dim}">From the basics to interviews. Every box is a series of lessons: open it at ${esc(host)}</text>`);
  out.push(`<rect x="${cx - 52}" y="116" width="104" height="26" rx="13" fill="none" stroke="${accents.sky}" stroke-width="2"/><text x="${cx}" y="134" text-anchor="middle" font-family="${FONT}" font-size="12" letter-spacing="1.5" fill="${accents.sky}">START HERE</text>`);
  out.push(...lines, ...nodes);
  out.push(`<line x1="${cx}" y1="${prevBottom}" x2="${cx}" y2="${prevBottom + 22}" stroke="${accents.sky}" stroke-width="3" stroke-opacity="0.6"/>`);
  out.push(`<rect x="${cx - 100}" y="${prevBottom + 22}" width="200" height="26" rx="13" fill="none" stroke="${accents.sky}" stroke-width="2"/><text x="${cx}" y="${prevBottom + 40}" text-anchor="middle" font-family="${FONT}" font-size="12" letter-spacing="1.5" fill="${accents.sky}">READY FOR INTERVIEWS</text>`);
  out.push(`<line x1="${M}" y1="${H - 52}" x2="${W - M}" y2="${H - 52}" stroke="${line}"/>`);
  out.push(`<text x="${cx}" y="${H - 22}" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="600" fill="${ink}">${esc(host)}</text>`);
  out.push(`</svg>`);
  return { svg: out.join(""), width: W, height: H };
}

function save(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/** Two buttons that save the roadmap as a picture (PNG) or as a clickable vector file (SVG). */
export default function RoadmapDownload(props: Props) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const light = () => document.documentElement.getAttribute("data-theme") === "light";

  function downloadSvg() {
    const { svg } = buildSvg(props, light());
    save(new Blob([svg], { type: "image/svg+xml" }), "developer-roadmap.svg");
  }

  async function downloadPng() {
    setBusy(true);
    setFailed(false);
    try {
      const { svg, width, height } = buildSvg(props, light());
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("image"));
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      });
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("png");
      save(blob, "developer-roadmap.png");
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const btn =
    "inline-flex h-9 items-center gap-2 rounded-full border border-line bg-bg-elev px-4 text-[0.85rem] text-ink transition-colors hover:border-sky hover:text-sky focus-visible:outline-2 focus-visible:outline-sky disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={downloadPng} disabled={busy} className={btn}>
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </svg>
        {busy ? "Preparing…" : "Download PNG"}
      </button>
      <button type="button" onClick={downloadSvg} className={btn} title="A vector file where every box is a link to its lessons">
        Download SVG
      </button>
      {failed ? <span role="status" className="text-[0.8rem] text-amber-300">Could not make the image. Try the SVG instead.</span> : null}
    </div>
  );
}
