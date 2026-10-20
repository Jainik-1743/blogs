import type { ReactNode } from "react";

/**
 * Skeleton placeholders: grey blocks in the shape of the content that is about to appear, so the page
 * does not jump when data arrives. The pulse is switched off for readers who prefer reduced motion.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  // A custom rounded-* class replaces the default; two competing ones would be decided by CSS order.
  const round = /(^|\s)rounded/.test(className) ? "" : "rounded-md";
  return <span aria-hidden="true" className={`block ${round} bg-ink-dim/15 motion-safe:animate-pulse ${className}`} />;
}

/** Wraps a skeleton so screen readers hear one "Loading" message instead of nothing. */
export function SkeletonRegion({ label = "Loading", className = "", children }: { label?: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}

const CARD = "rounded-2xl border border-line bg-bg-elev p-5 sm:p-7";

/** A line of text: width is a Tailwind class such as "w-2/3". */
const Line = ({ w = "w-full", h = "h-3.5" }: { w?: string; h?: string }) => <Skeleton className={`${h} ${w}`} />;

/** The sign-in and sign-up form while the session is being checked. */
export function AuthFormSkeleton() {
  return (
    <SkeletonRegion label="Checking your session" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5"><Skeleton className="h-7 w-2/3" /><Line w="w-5/6" /></div>
      <Skeleton className="h-12 w-full rounded-lg" />
      <Line w="w-1/3" h="h-3" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2"><Line w="w-16" h="h-3" /><Skeleton className="h-11 w-full rounded-lg" /></div>
        <div className="flex flex-col gap-2"><Line w="w-20" h="h-3" /><Skeleton className="h-11 w-full rounded-lg" /></div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </SkeletonRegion>
  );
}

/** The account page: header card, bookmarks card, overview, then the profile and progress cards. */
export function AccountSkeleton() {
  return (
    <SkeletonRegion label="Loading your account" className="flex flex-col gap-6">
      <div className="rounded-3xl border border-line bg-bg-elev p-5 sm:p-9">
        <div className="flex flex-wrap items-center gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex flex-1 flex-col gap-3"><Skeleton className="h-8 w-56 max-w-full" /><Line w="w-64 max-w-full" /><Skeleton className="h-6 w-28 rounded-full" /></div>
        </div>
      </div>
      <div className={CARD}><div className="flex items-center justify-between gap-4"><div className="flex flex-1 flex-col gap-2.5"><Skeleton className="h-5 w-28" /><Line w="w-64 max-w-full" /></div><Skeleton className="h-10 w-28 rounded-lg" /></div></div>
      <div className="rounded-3xl border border-line bg-bg-elev p-5 sm:p-9">
        <Skeleton className="mb-6 h-6 w-48" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="mt-8 h-32 w-full rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className={`${CARD} flex flex-col gap-5`}>
          <Skeleton className="h-5 w-24" />
          {[0, 1, 2].map((i) => <div key={i} className="flex flex-col gap-2"><Line w="w-24" h="h-3" /><Skeleton className="h-11 w-full rounded-lg" /></div>)}
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
        <div className={`${CARD} flex flex-col gap-4`}><Skeleton className="h-5 w-32" /><div className="grid grid-cols-2 gap-3"><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-20 rounded-xl" /></div><Line w="w-full" /><Line w="w-2/3" /></div>
      </div>
    </SkeletonRegion>
  );
}

/** A reading badge card, shown on the account page while the badge list loads. */
export function BadgesSkeleton() {
  return (
    <SkeletonRegion label="Loading your badges" className="rounded-3xl border border-line bg-bg-elev p-5 sm:p-9">
      <div className="flex flex-wrap items-center gap-8">
        <Skeleton className="h-36 w-32 rounded-xl" />
        <div className="flex min-w-0 flex-1 basis-72 flex-col gap-3"><Line w="w-28" h="h-3" /><Skeleton className="h-8 w-48" /><Line w="w-5/6" /><Skeleton className="mt-2 h-2 w-full max-w-md rounded-full" /></div>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-6 sm:grid-cols-5">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
    </SkeletonRegion>
  );
}

/** The bookmarks page: header, search, chips and a few rows. */
export function BookmarksSkeleton() {
  return (
    <SkeletonRegion label="Loading your bookmarks">
      <div className="mb-8 border-b border-line pb-6">
        <Line w="w-40" h="h-3" />
        <Skeleton className="mt-4 h-10 w-64 max-w-full" />
        <Skeleton className="mt-4 h-4 w-full max-w-xl" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="flex flex-col gap-2"><Line w="w-14" h="h-3" /><Skeleton className="h-5 w-16" /></div>)}</div>
      </div>
      <Skeleton className="h-11 w-full max-w-md rounded-lg" />
      <div className="mt-4 flex flex-wrap gap-2">{["w-12", "w-24", "w-28", "w-24", "w-16"].map((w, i) => <Skeleton key={i} className={`h-8 rounded-md ${w}`} />)}</div>
      <BookmarkRowsSkeleton />
    </SkeletonRegion>
  );
}

/** Rows of saved lessons (title, series line and a button). */
export function BookmarkRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="mt-8">
      <Skeleton className="mb-3 h-6 w-40" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 border-b border-line py-3.5">
          <div className="flex flex-1 flex-col gap-2"><Skeleton className={`h-4 ${i % 2 ? "w-3/5" : "w-4/5"}`} /><Line w="w-1/3" h="h-3" /></div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** A short two-line summary (used inside cards). */
export function SummarySkeleton() {
  return <span role="status" aria-busy="true" className="mt-2 flex flex-col gap-2"><span className="sr-only">Loading…</span><Skeleton className="h-3.5 w-56 max-w-full" /></span>;
}

/** The admin badge list. */
export function AdminSkeleton() {
  return (
    <SkeletonRegion label="Loading" className="flex flex-col gap-8">
      <div className="flex flex-col gap-3"><Line w="w-16" h="h-3" /><Skeleton className="h-9 w-40" /><Line w="w-full max-w-xl" /></div>
      {[0, 1].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
    </SkeletonRegion>
  );
}

/** The "continue / today's lesson" card in the home hero. */
export function HeroCardSkeleton() {
  return (
    <SkeletonRegion label="Loading" className="mt-8 max-w-[34rem] rounded-xl border border-line bg-bg-elev p-5">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-3 h-5 w-4/5" />
      <Skeleton className="mt-2 h-3.5 w-24" />
    </SkeletonRegion>
  );
}

/** The progress bar card on the lesson roadmap pages. */
export function ProgressBarSkeleton() {
  return (
    <SkeletonRegion label="Loading your progress" className="mb-10 rounded-xl border border-line bg-bg-elev px-5 py-4">
      <div className="mb-3 flex justify-between"><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-32" /></div>
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="mt-3 h-3 w-2/3" />
    </SkeletonRegion>
  );
}
