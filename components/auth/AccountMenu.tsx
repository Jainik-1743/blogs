"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { initialsOf } from "@/lib/accounts";
import { useToast } from "@/components/Toast";
import { useAccount } from "./AuthProvider";

const ADMINS = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

/** Header control: "Sign in" for visitors, an avatar menu for readers who are signed in. */
export default function AccountMenu() {
  const { enabled, status, profile, user, signOut } = useAccount();
  const pathname = usePathname();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!enabled) return null;
  if (status === "loading") return <span className="h-9 w-20" aria-hidden="true" />;
  if (status === "out" || !user)
    return (
      <Link href="/login" className="rounded-lg border border-line px-3.5 py-1.5 text-[0.85rem] font-semibold text-ink transition hover:border-sky hover:text-sky hover:no-underline">
        Sign in
      </Link>
    );

  const name = profile?.name ?? user.email ?? "You";
  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu" className="grid h-9 w-9 place-items-center rounded-full bg-sky text-[0.8rem] font-bold tracking-wide text-bg transition hover:brightness-110">
        {initialsOf(name)}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-xl border border-line bg-bg-elev shadow-xl">
          <p className="m-0 truncate border-b border-line px-4 py-3 text-[0.85rem] text-ink-dim">Signed in as <strong className="text-ink">{name}</strong></p>
          <Link role="menuitem" href="/account" className="block px-4 py-2.5 text-[0.9rem] text-ink hover:bg-sky-soft hover:no-underline">Your account</Link>
          {profile && ADMINS.includes(profile.email.toLowerCase()) && (
            <Link role="menuitem" href="/admin/badges" className="block px-4 py-2.5 text-[0.9rem] text-ink hover:bg-sky-soft hover:no-underline">Manage badges</Link>
          )}
          <button role="menuitem" type="button" onClick={() => void signOut().then(() => toast("You are signed out.", "info"))} className="block w-full px-4 py-2.5 text-left text-[0.9rem] text-ink hover:bg-sky-soft">Sign out</button>
        </div>
      )}
    </div>
  );
}
