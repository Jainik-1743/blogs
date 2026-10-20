"use client";

/**
 * Draws the picture that goes with a shared badge or streak: a portrait card (1080 x 1350) with the badge on a dark,
 * softly glowing background and the reader's achievement underneath. It is drawn in the browser, so nothing is
 * uploaded anywhere. Returns a PNG file the reader can send or download.
 */
export type CardOptions = {
  /** Badge picture: a site path, a URL or a data: URL. */
  image: string;
  title: string;
  subtitle: string;
  footer: string;
  /** Glow colour, as r,g,b. */
  glow?: string;
  /** For the streak card: the number drawn over the centre of the flame badge. */
  number?: number;
};

const W = 1080;
const H = 1350;

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The badge picture could not be loaded."));
    img.src = src;
  });
}

export async function renderShareCard(o: CardOptions): Promise<{ blob: Blob; dataUrl: string }> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  const glow = o.glow ?? "56,189,248";

  // Background, a glow behind the badge, and a fine frame.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0e1730");
  bg.addColorStop(1, "#060a14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const halo = ctx.createRadialGradient(W / 2, 560, 40, W / 2, 560, 620);
  halo.addColorStop(0, `rgba(${glow},0.38)`);
  halo.addColorStop(1, `rgba(${glow},0)`);
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = `rgba(${glow},0.35)`;
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  // The badge, centred and kept in proportion.
  const img = await load(o.image);
  const box = 720;
  const scale = Math.min(box / img.width, box / img.height);
  const bw = img.width * scale;
  const bh = img.height * scale;
  const bx = (W - bw) / 2;
  const by = 560 - bh / 2;
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 50;
  ctx.drawImage(img, bx, by, bw, bh);
  ctx.shadowBlur = 0;

  if (o.number !== undefined) {
    // The streak count, drawn where the flame badge keeps its empty centre.
    const text = String(o.number);
    const size = bw * (text.length <= 2 ? 0.19 : text.length === 3 ? 0.155 : 0.125);
    ctx.font = `900 ${size}px ${family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cx = bx + bw * 0.496;
    const cy = by + bh * 0.537;
    ctx.fillStyle = "#a8480a";
    ctx.fillText(text, cx, cy + size * 0.04);
    const g = ctx.createLinearGradient(0, cy - size / 2, 0, cy + size / 2);
    g.addColorStop(0, "#fff7c9");
    g.addColorStop(0.45, "#ffd84d");
    g.addColorStop(1, "#ff9f1c");
    ctx.shadowColor = "rgba(255,150,30,0.6)";
    ctx.shadowBlur = size * 0.18;
    ctx.fillStyle = g;
    ctx.fillText(text, cx, cy);
    ctx.shadowBlur = 0;
  }

  // Words under the badge.
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 82px ${family}`;
  ctx.fillText(o.title, W / 2, 1010);
  ctx.fillStyle = "#9fb0c8";
  ctx.font = `500 40px ${family}`;
  ctx.fillText(o.subtitle, W / 2, 1080);

  const line = ctx.createLinearGradient(W / 2 - 220, 0, W / 2 + 220, 0);
  line.addColorStop(0, `rgba(${glow},0)`);
  line.addColorStop(0.5, `rgba(${glow},0.9)`);
  line.addColorStop(1, `rgba(${glow},0)`);
  ctx.fillStyle = line;
  ctx.fillRect(W / 2 - 220, 1135, 440, 3);

  ctx.fillStyle = `rgb(${glow})`;
  ctx.font = `600 36px ${family}`;
  ctx.fillText(o.footer, W / 2, 1230);

  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("The card could not be drawn."))), "image/png"));
  return { blob, dataUrl: canvas.toDataURL("image/png") };
}
