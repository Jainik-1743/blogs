import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-15 max-w-[860px] items-center justify-between gap-4 px-4">
        <Link href="/" className="font-bold tracking-tight hover:text-sky">
          jainik<span className="text-sky">.blogs</span>
        </Link>
        <nav className="flex gap-5 text-[0.95rem]">
          <Link href="/" className="text-ink-dim hover:text-sky">
            Home
          </Link>
          <Link href="/devops" className="text-ink-dim hover:text-sky">
            DevOps
          </Link>
        </nav>
      </div>
    </header>
  );
}
