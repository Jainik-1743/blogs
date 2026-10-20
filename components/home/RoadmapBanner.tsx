import Link from "next/link";

/** Call-to-action for the roadmap: one bordered band, text on the left and the action on the right. */
export default function RoadmapBanner() {
  return (
    <section aria-labelledby="roadmap-cta" className="flex flex-wrap items-center justify-between gap-6 rounded-xl border border-line bg-bg-elev px-8 py-9">
      <div className="max-w-xl">
        <p className="mb-2 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-sky">Developer roadmap</p>
        <h2 id="roadmap-cta" className="m-0 text-[1.6rem] font-bold leading-tight tracking-tight text-ink">One map for every series</h2>
        <p className="mt-2 mb-0 text-ink-dim">Follow the line from the basics to interviews. Every box opens its lessons, and you can download the map.</p>
      </div>
      <Link href="/roadmap" className="rounded-lg bg-sky px-6 py-3 font-semibold text-bg transition hover:no-underline hover:brightness-110">
        Open the roadmap
      </Link>
    </section>
  );
}
