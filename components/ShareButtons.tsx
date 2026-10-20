"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import LessonTools from "./LessonTools";
import BookmarkButton from "./BookmarkButton";

/** Round icon button used for both the share and copy controls. */
const ICON_BTN =
  "inline-flex h-9 w-10 items-center justify-center text-ink-dim transition hover:bg-sky-soft hover:text-sky focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky";
const PILL = "inline-flex items-center divide-x divide-line overflow-hidden rounded-full border border-line bg-bg-elev";

const SHARE_ICON = "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13";
const CHECK_ICON = "M5 13l4 4L19 7";
const COPY_ICON = "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7";

function Stroke({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/** The page address without any #anchor, read in the browser so it is always right. */
function currentUrl() {
  return window.location.origin + window.location.pathname;
}

/** The page's own h1 is the share title, so each page shares its own name. */
function currentTitle() {
  return document.querySelector("h1")?.textContent?.trim() || document.title;
}

function MenuLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={ICON_BTN}>
      {children}
    </a>
  );
}

/**
 * Two icon buttons placed under a page title: Share and Copy link. On phones Share opens the
 * device's own share sheet. On desktop it opens a small menu of X, LinkedIn and WhatsApp icons.
 */
export default function ShareButtons() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const [links, setLinks] = useState<{ url: string; text: string } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanNative(typeof navigator.share === "function");
    setLinks({ url: encodeURIComponent(currentUrl()), text: encodeURIComponent(currentTitle()) });
    function onDown(e: MouseEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  async function share() {
    if (canNative) {
      try {
        await navigator.share({ title: currentTitle(), url: currentUrl() });
      } catch {
        // The user closed the share sheet. Nothing to do.
      }
      return;
    }
    setOpen((v) => !v);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked; the address is still in the browser bar.
    }
  }

  return (
    <div ref={wrap} className="my-4 flex flex-wrap items-center gap-2">
      <div className={PILL}>
        <button type="button" onClick={share} aria-label="Share" aria-expanded={canNative ? undefined : open} title="Share" className={`${ICON_BTN} ${open && !canNative ? "bg-sky-soft text-sky" : ""}`}>
          <Stroke d={SHARE_ICON} />
        </button>
        <button type="button" onClick={copy} aria-label="Copy link" title="Copy link" className={`${ICON_BTN} ${copied ? "text-emerald-300" : ""}`}>
          <Stroke d={copied ? CHECK_ICON : COPY_ICON} />
        </button>
      </div>
      <BookmarkButton />
      <LessonTools />
      {copied ? (
        <span role="status" className="font-mono text-[0.75rem] text-emerald-300">
          Link copied
        </span>
      ) : null}

      {open && !canNative && links ? (
        <div className={PILL}>
          <MenuLink href={`https://twitter.com/intent/tweet?url=${links.url}&text=${links.text}`} label="Share on X">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M18.2 2h3.4l-7.4 8.5L23 22h-6.8l-5.3-7-6.1 7H1.4l7.9-9.1L1 2h7l4.8 6.4L18.2 2zm-1.2 18h1.9L7.1 3.9H5.1L17 20z" />
            </svg>
          </MenuLink>
          <MenuLink href={`https://www.linkedin.com/sharing/share-offsite/?url=${links.url}`} label="Share on LinkedIn">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3V9.75zM9.5 9.75h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.75z" />
            </svg>
          </MenuLink>
          <MenuLink href={`https://wa.me/?text=${links.text}%20${links.url}`} label="Share on WhatsApp">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4.3-.4c.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.8c.1.2 1.9 3 4.7 4.1 2.8 1.1 2.8.7 3.3.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
            </svg>
          </MenuLink>
        </div>
      ) : null}
    </div>
  );
}
