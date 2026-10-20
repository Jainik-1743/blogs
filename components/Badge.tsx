import type { Badge as BadgeData } from "@/lib/badges";

/** One badge picture. Locked badges are shown dimmed and in grey so the reader can see what is ahead. */
export default function Badge({ badge, size = 96, locked = false }: { badge: Pick<BadgeData, "name" | "image">; size?: number; locked?: boolean }) {
  return (
    // The picture can be a site path, a URL or a data: URL saved from the admin page, so a plain <img> is used.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={badge.image}
      alt={locked ? `${badge.name} badge, not earned yet` : `${badge.name} badge`}
      width={size}
      style={{ width: size, height: "auto" }}
      loading="lazy"
      decoding="async"
      className={locked ? "opacity-35 grayscale" : "drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]"}
    />
  );
}
