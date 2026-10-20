"use client";

import { useEffect, useState } from "react";

/** The number in ?preview=120 on the current address, or null. The owner-only streak preview reads it. */
export function usePreviewDays(): number | null {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("preview"));
    setDays(Number.isFinite(v) && v > 0 ? v : null);
  }, []);
  return days;
}
