import Link from "next/link";
import Logo from "./Logo";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-15 max-w-[860px] items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="flex gap-5 text-[0.95rem]">
          <Link href="/" className="text-ink-dim hover:text-sky">
            Home
          </Link>
          <Link href="/devops" className="text-ink-dim hover:text-sky">
            DevOps
          </Link>
          <Link href="/javascript" className="text-ink-dim hover:text-sky">
            JavaScript
          </Link>
        </nav>
      </div>
    </header>
  );
}
