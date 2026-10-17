"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/**
 * Fades the page in, with a small rise, each time the reader navigates to another page. It uses the
 * browser's own animation support (the Web Animations API), so there is no library and nothing to
 * download. It skips the first load and respects "reduce motion" in the system settings.
 *
 * (React's <ViewTransition> was tried first. It did not fire for these routes, where the lesson
 * number is a URL parameter, so this simpler approach is used for every page alike.)
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // A layout effect runs before the browser paints, so the new page never flashes at full opacity first.
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const run = el.animate(
      [
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 280, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
    );
    return () => run.cancel();
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
