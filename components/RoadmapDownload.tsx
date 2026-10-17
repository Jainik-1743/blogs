"use client";

import { useState } from "react";
import type { Block, Cell } from "@/lib/roadmap";

type Props = { blocks: Block[]; siteUrl: string; detailed?: boolean; fileName: string };

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
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/** Builds the roadmap as one standalone SVG. Every box links to its page on the live site. */
function buildSvg({ blocks, siteUrl, detailed }: Props, light: boolean): { svg: string; width: number; height: number } {
  const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const base = siteUrl.replace(/\/$/, "");
  const bg = light ? "#f8fafc" : "#0b1120";
  const cardBg = light ? "#ffffff" : "#111a2e";
  const ink = light ? "#0f172a" : "#e2e8f0";
  const dim = light ? "#475569" : "#94a3b8";
  const line = light ? "#cbd5e1" : "#1e293b";
  const onAccent = light ? "#ffffff" : "#0b1120";
  const accents = light ? ACCENT_HEX_LIGHT : ACCENT_HEX;
  const sky = accents.sky;

  // Detailed maps hold hundreds of lesson boxes, so the boxes are smaller there.
  const CW = detailed ? 252 : 236;
  const CH = detailed ? 40 : 48;
  const GAP = detailed ? 8 : 12;
  const FS = detailed ? 12.5 : 15;
  const CLIP = detailed ? 40 : 32;
  const M = 40, GUT = 70, NW = 248, NH = 74, STAGE_GAP = detailed ? 28 : 40;
  const W = M * 2 + CW * 2 + GUT * 2 + NW;
  const cx = W / 2;
  const leftX = M, rightX = W - M - CW;

  const lines: string[] = [];
  const nodes: string[] = [];
  let y = 150;
  let prevBottom = 142;

  const spine = (to: number, col: string) =>
    lines.push(`<line x1="${cx}" y1="${prevBottom}" x2="${cx}" y2="${to}" stroke="${col}" stroke-width="3" stroke-opacity="0.6"/>`);

  for (const b of blocks) {
    const col = accents[b.accent] ?? sky;
    if (b.kind === "phase") {
      const label = `STEP ${b.step}  ·  ${b.title.toUpperCase()}`;
      const w = Math.max(220, label.length * 9.5 + 40);
      spine(y + 6, col);
      nodes.push(
        `<rect x="${cx - w / 2}" y="${y + 6}" width="${w}" height="34" rx="17" fill="${bg}" stroke="${col}" stroke-width="2"/>` +
          `<text x="${cx}" y="${y + 28}" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" letter-spacing="1.2" fill="${ink}">${esc(label)}</text>`,
      );
      prevBottom = y + 40;
      y += 40 + 18;
      continue;
    }

    const n = Math.max(b.left.length, b.right.length, 1);
    const h = Math.max(n * CH + (n - 1) * GAP, NH);
    const mid = y + h / 2;
    spine(mid - NH / 2, col);

    const side = (cards: Cell[], isLeft: boolean) => {
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
        const cc = accents[c.accent] ?? col;
        lines.push(`<path d="M${edge} ${ys[i]} H${bracketX}" stroke="${col}" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round" fill="none"/>`);
        const label = clip(c.label, CLIP);
        const fs = label.length > 28 && !detailed ? 13.5 : FS;
        const textY = c.sub ? cy + (detailed ? 17 : 21) : cy + CH / 2 + 5;
        nodes.push(
          `<a href="${esc(base + c.href)}"><rect x="${x}" y="${cy}" width="${CW}" height="${CH}" rx="${detailed ? 8 : 10}" fill="${cardBg}" stroke="${cc}" stroke-width="2"/>` +
            `<text x="${x + CW / 2}" y="${textY}" text-anchor="middle" font-family="${FONT}" font-size="${fs}" font-weight="600" fill="${ink}">${esc(label)}</text>` +
            (c.sub ? `<text x="${x + CW / 2}" y="${cy + (detailed ? 32 : 38)}" text-anchor="middle" font-family="${FONT}" font-size="${detailed ? 10 : 11}" fill="${dim}">${esc(c.sub)}</text>` : "") +
            `</a>`,
        );
      });
    };
    side(b.left, true);
    side(b.right, false);

    // The centre box only names the step, so it is not a link.
    const t = clip(b.title, 24);
    nodes.push(
      `<rect x="${cx - NW / 2}" y="${mid - NH / 2}" width="${NW}" height="${NH}" rx="14" fill="${col}"/>` +
        (b.eyebrow ? `<text x="${cx}" y="${mid - 13}" text-anchor="middle" font-family="${FONT}" font-size="11" letter-spacing="1.5" fill="${onAccent}" fill-opacity="0.75">${esc(b.eyebrow.toUpperCase())}</text>` : "") +
        `<text x="${cx}" y="${mid + (b.eyebrow ? 8 : 2)}" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="700" fill="${onAccent}">${esc(t)}</text>` +
        `<text x="${cx}" y="${mid + (b.eyebrow ? 26 : 22)}" text-anchor="middle" font-family="${FONT}" font-size="12" fill="${onAccent}" fill-opacity="0.85">${esc(b.sub)}</text>`,
    );
    prevBottom = mid + NH / 2;
    y += h + STAGE_GAP;
  }

  const H = Math.max(y, prevBottom + 40) + 80;
  const sub = detailed
    ? `Every lesson in order. Each box links to its lesson at ${host}`
    : `From the basics to interviews. Each box links to its lessons at ${host}`;
  const out: string[] = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  out.push(`<rect width="${W}" height="${H}" fill="${bg}"/>`);
  out.push(`<text x="${cx}" y="66" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="800" fill="${sky}">${detailed ? "Detailed Developer Roadmap" : "Developer Roadmap"}</text>`);
  out.push(`<text x="${cx}" y="98" text-anchor="middle" font-family="${FONT}" font-size="15" fill="${dim}">${esc(sub)}</text>`);
  out.push(`<rect x="${cx - 52}" y="116" width="104" height="26" rx="13" fill="${bg}" stroke="${sky}" stroke-width="2"/><text x="${cx}" y="134" text-anchor="middle" font-family="${FONT}" font-size="12" letter-spacing="1.5" fill="${sky}">START HERE</text>`);
  out.push(...lines);
  out.push(`<line x1="${cx}" y1="${prevBottom}" x2="${cx}" y2="${prevBottom + 22}" stroke="${sky}" stroke-width="3" stroke-opacity="0.6"/>`);
  out.push(...nodes);
  out.push(`<rect x="${cx - 100}" y="${prevBottom + 22}" width="200" height="26" rx="13" fill="${bg}" stroke="${sky}" stroke-width="2"/><text x="${cx}" y="${prevBottom + 40}" text-anchor="middle" font-family="${FONT}" font-size="12" letter-spacing="1.5" fill="${sky}">READY FOR INTERVIEWS</text>`);
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
    save(new Blob([svg], { type: "image/svg+xml" }), `${props.fileName}.svg`);
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
      // Browsers cap a canvas at about 16,000 pixels on a side, so a very tall map is drawn at a smaller scale.
      const scale = Math.min(2, 15000 / height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("png");
      save(blob, `${props.fileName}.png`);
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
      <button type="button" onClick={downloadSvg} className={btn} title="A vector file where every box is a link">
        Download SVG
      </button>
      {failed ? <span role="status" className="text-[0.8rem] text-amber-300">Could not make the image. Try the SVG instead.</span> : null}
    </div>
  );
}
