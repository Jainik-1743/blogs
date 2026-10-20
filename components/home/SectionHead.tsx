import Link from "next/link";

/** Title, optional description and optional link for a home-page section, over a hairline. */
export default function SectionHead({
  id, title, blurb, href, linkLabel,
}: { id: string; eyebrow?: string; title: string; blurb?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-2xl">
        <h2 id={id} className="m-0 text-[1.9rem] font-bold leading-tight tracking-tight text-ink max-sm:text-[1.5rem]">{title}</h2>
        {blurb && <p className="mt-2 mb-0 text-[1.02rem] text-ink-dim">{blurb}</p>}
      </div>
      {href && <Link href={href} className="text-[0.9rem] font-semibold">{linkLabel ?? "See all"} →</Link>}
    </div>
  );
}
