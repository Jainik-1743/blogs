import Link from "next/link";
import Logo from "./Logo";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-15 max-w-[860px] items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="flex gap-x-5 gap-y-1 overflow-x-auto whitespace-nowrap text-[0.95rem] max-sm:gap-x-3 max-sm:text-[0.85rem]">
          <Link href="/" className="text-ink-dim hover:text-sky">
            Home
          </Link>
          <Link href="/devops" className="text-ink-dim hover:text-sky">
            DevOps
          </Link>
          <Link href="/javascript" className="text-ink-dim hover:text-sky">
            JavaScript
          </Link>
          <Link href="/system-design" className="text-ink-dim hover:text-sky">
            System Design
          </Link>
        </nav>
      </div>
    </header>
  );
}
