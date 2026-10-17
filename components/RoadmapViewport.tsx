"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const MIN_K = 0.2;
const MAX_K = 2.5;
const PAD = 80;
const MM_W = 150;
const MM_H = 180;

type View = { x: number; y: number; k: number };
type Box = { x: number; y: number; w: number; h: number; c: string };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Makes the roadmap a map you can move around: drag to pan, scroll to zoom (after you click the map, so
 * the page itself still scrolls normally), buttons and keys too, a mini-map in the corner, and
 * pointing at a box lights up its path back to the start. Below 720px wide the roadmap is a plain
 * list instead, because a phone screen is too small for a map. Nothing is saved.
 */
export default function RoadmapViewport({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });
  const viewRef = useRef(view);
  const [enabled, setEnabled] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const [boxes, setBoxes] = useState<{ w: number; h: number; items: Box[] } | null>(null);
  const [size, setSize] = useState({ vw: 0, vh: 0 });
  const [path, setPath] = useState<{ x: number; y1: number; y2: number; c: string } | null>(null);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ moved: boolean; startDist: number; startK: number } | null>(null);
  const armed = useRef(false);
  const hot = useRef<HTMLElement[]>([]);

  const apply = useCallback((next: View) => {
    const f = frame.current;
    const c = content.current;
    if (!f || !c) return;
    const k = clamp(next.k, MIN_K, MAX_K);
    const cw = c.offsetWidth * k;
    const ch = c.offsetHeight * k;
    const x = clamp(next.x, Math.min(PAD, f.clientWidth - cw - PAD), PAD);
    const y = clamp(next.y, Math.min(PAD, f.clientHeight - ch - PAD), PAD);
    const v = { x, y, k };
    viewRef.current = v;
    setView(v);
  }, []);

  /** Zoom by a factor, keeping the point (px, py) of the frame where it is. */
  const zoomAt = useCallback(
    (factor: number, px: number, py: number) => {
      const { x, y, k } = viewRef.current;
      const nk = clamp(k * factor, MIN_K, MAX_K);
      const r = nk / k;
      apply({ k: nk, x: px - (px - x) * r, y: py - (py - y) * r });
    },
    [apply],
  );

  const zoomCentre = (factor: number) => {
    const f = frame.current;
    if (f) zoomAt(factor, f.clientWidth / 2, f.clientHeight / 2);
  };

  // Turn the map on only for wide screens.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 720px)");
    const on = () => setEnabled(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Measure the frame, and the boxes for the mini-map (at zoom 1, before the reader has moved anything).
  useLayoutEffect(() => {
    if (!enabled) return;
    const f = frame.current;
    const c = content.current;
    if (!f || !c) return;
    const measure = () => {
      setSize({ vw: f.clientWidth, vh: f.clientHeight });
      const base = c.getBoundingClientRect();
      const k = viewRef.current.k || 1;
      const items: Box[] = [];
      c.querySelectorAll<HTMLElement>(".rm-card, .rm-node, .rm-phase, .rm-pill").forEach((el) => {
        const r = el.getBoundingClientRect();
        const color = getComputedStyle(el).getPropertyValue("--color-sky").trim() || "#38bdf8";
        items.push({ x: (r.left - base.left) / k, y: (r.top - base.top) / k, w: r.width / k, h: r.height / k, c: color });
      });
      setBoxes({ w: c.offsetWidth, h: c.offsetHeight, items });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(f);
    return () => ro.disconnect();
  }, [enabled]);

  // Scroll to zoom: only once the reader has clicked the map (or holds Ctrl / ⌘), so the page still scrolls.
  useEffect(() => {
    const f = frame.current;
    if (!f || !enabled) return;
    const onWheel = (e: WheelEvent) => {
      if (!armed.current && !e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = f.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX - r.left, e.clientY - r.top);
    };
    f.addEventListener("wheel", onWheel, { passive: false });
    return () => f.removeEventListener("wheel", onWheel);
  }, [enabled, zoomAt]);

  const clearHot = () => {
    hot.current.forEach((el) => el.classList.remove("rm-hot", "rm-hot-side"));
    hot.current = [];
    frame.current?.classList.remove("rmv-hovering");
    setPath(null);
  };

  /** Light up the hovered box, its step, and the line back to the start. */
  const onOver = (e: React.PointerEvent) => {
    if (dragging || e.pointerType !== "mouse") return;
    const card = (e.target as Element).closest<HTMLElement>(".rm-card");
    const c = content.current;
    if (!card || !c) return clearHot();
    if (hot.current[0] === card) return;
    clearHot();
    const stage = card.closest<HTMLElement>(".rm-stage");
    const side = card.closest<HTMLElement>(".rm-side");
    const node = stage?.querySelector<HTMLElement>(".rm-node");
    if (!stage || !node) return;
    card.classList.add("rm-hot");
    side?.classList.add("rm-hot-side");
    stage.classList.add("rm-hot");
    hot.current = [card, ...(side ? [side] : []), stage];
    frame.current?.classList.add("rmv-hovering");
    const base = c.getBoundingClientRect();
    const k = viewRef.current.k || 1;
    const nr = node.getBoundingClientRect();
    const rm = c.querySelector<HTMLElement>(".rm");
    setPath({
      x: c.offsetWidth / 2,
      y1: rm ? rm.offsetTop + 20 : 0,
      y2: (nr.top - base.top) / k + nr.height / (2 * k),
      c: getComputedStyle(node).getPropertyValue("--color-sky").trim() || "#38bdf8",
    });
  };

  // ---- dragging and pinching ----
  const onPointerDown = (e: React.PointerEvent) => {
    if (!enabled || e.button !== 0) return;
    if ((e.target as Element).closest("[data-rmv-ui]")) return;
    armed.current = true;
    setTouched(true);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    gesture.current = { moved: false, startDist: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0, startK: viewRef.current.k };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    const prev = pointers.current.get(e.pointerId);
    if (!g || !prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    const f = frame.current!;
    const r = f.getBoundingClientRect();
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.startDist) zoomAt((g.startK * (dist / g.startDist)) / viewRef.current.k, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
      g.moved = true;
      return;
    }
    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    if (!g.moved && Math.hypot(dx, dy) < 3) return;
    if (!g.moved) {
      g.moved = true;
      setDragging(true);
      clearHot();
      // Capture the pointer only once it is a drag. Capturing at the first press would redirect the click away from the box.
      frame.current?.setPointerCapture?.(e.pointerId);
    }
    apply({ ...viewRef.current, x: viewRef.current.x + dx, y: viewRef.current.y + dy });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    // The click that follows a drag is swallowed (below); after that, a fresh click works again.
    const g = gesture.current;
    if (g?.moved) setTimeout(() => (g.moved = false), 0);
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) setDragging(false);
    frame.current?.releasePointerCapture?.(e.pointerId);
  };

  // A drag that ends on a box must not open it.
  const onClickCapture = (e: React.MouseEvent) => {
    if (gesture.current?.moved && !(e.target as Element).closest("[data-rmv-ui]")) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!enabled || (e.target as Element).closest("a, button")) return;
    const v = viewRef.current;
    const step = 80;
    const actions: Record<string, () => void> = {
      ArrowUp: () => apply({ ...v, y: v.y + step }),
      ArrowDown: () => apply({ ...v, y: v.y - step }),
      ArrowLeft: () => apply({ ...v, x: v.x + step }),
      ArrowRight: () => apply({ ...v, x: v.x - step }),
      "+": () => zoomCentre(1.25),
      "=": () => zoomCentre(1.25),
      "-": () => zoomCentre(0.8),
      "0": () => apply({ x: 0, y: 0, k: 1 }),
    };
    const run = actions[e.key];
    if (run) {
      e.preventDefault();
      run();
    }
  };

  // ---- mini-map ----
  const mm = boxes ? Math.min(MM_W / boxes.w, MM_H / boxes.h) : 1;
  const moveFromMiniMap = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!boxes || size.vw === 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - r.left) / mm;
    const cy = (e.clientY - r.top) / mm;
    const k = viewRef.current.k;
    apply({ k, x: size.vw / 2 - cx * k, y: size.vh / 2 - cy * k });
  };

  const style = enabled ? { transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` } : undefined;
  const btn =
    "grid h-8 w-8 place-items-center rounded-lg border border-line bg-bg-elev/95 text-[1rem] text-ink transition-colors hover:border-sky hover:text-sky focus-visible:outline-2 focus-visible:outline-sky";

  return (
    <div
      ref={frame}
      className={`rmv relative ${enabled ? "rmv-on" : ""} ${dragging ? "rmv-drag" : ""}`}
      tabIndex={enabled ? 0 : undefined}
      aria-label={enabled ? "Roadmap. Drag to move, scroll to zoom after clicking, arrow keys to move, plus and minus to zoom." : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerOver={onOver}
      onPointerLeave={() => {
        armed.current = false;
        clearHot();
      }}
      onClickCapture={onClickCapture}
      onKeyDown={onKeyDown}
    >
      <div ref={content} className="rmv-content" style={style}>
        {children}
        {path ? (
          <div
            aria-hidden="true"
            className="rm-path"
            style={{ left: path.x - 2, top: path.y1, height: Math.max(0, path.y2 - path.y1), background: path.c, boxShadow: `0 0 12px ${path.c}` }}
          />
        ) : null}
      </div>

      {enabled ? (
        <>
          <div data-rmv-ui className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            <button type="button" className={btn} onClick={() => zoomCentre(1.25)} aria-label="Zoom in" title="Zoom in">
              +
            </button>
            <button type="button" className={btn} onClick={() => zoomCentre(0.8)} aria-label="Zoom out" title="Zoom out">
              −
            </button>
            <button type="button" className={`${btn} text-[0.62rem] font-mono`} onClick={() => apply({ x: 0, y: 0, k: 1 })} aria-label="Reset view" title="Reset view">
              1:1
            </button>
          </div>

          {boxes ? (
            <svg
              data-rmv-ui
              role="img"
              aria-label="Mini-map. Click or drag to move the view."
              width={boxes.w * mm}
              height={boxes.h * mm}
              className="absolute right-3 bottom-3 z-10 cursor-pointer rounded-md border border-line bg-bg-elev/90 shadow-lg backdrop-blur"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                moveFromMiniMap(e);
              }}
              onPointerMove={(e) => e.buttons === 1 && moveFromMiniMap(e)}
            >
              {boxes.items.map((b, i) => (
                <rect key={i} x={b.x * mm} y={b.y * mm} width={Math.max(1, b.w * mm)} height={Math.max(1, b.h * mm)} rx="1" fill={b.c} opacity="0.55" />
              ))}
              <rect
                x={(-view.x / view.k) * mm}
                y={(-view.y / view.k) * mm}
                width={Math.min(boxes.w, size.vw / view.k) * mm}
                height={Math.min(boxes.h, size.vh / view.k) * mm}
                fill="var(--color-sky)"
                fillOpacity="0.12"
                stroke="var(--color-sky)"
                strokeWidth="1.5"
              />
            </svg>
          ) : null}

          {!touched ? (
            <p data-rmv-ui className="pointer-events-none absolute bottom-3 left-3 z-10 m-0 rounded-lg border border-line bg-bg-elev/95 px-3 py-1.5 text-[0.78rem] text-ink-dim">
              Drag to move. Click the map, then scroll to zoom. Point at a box to see its path.
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
