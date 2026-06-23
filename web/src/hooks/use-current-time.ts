"use client";

import { useEffect, useState } from "react";

/** Keeps a live clock for schedule highlighting. Updates every minute by default. */
export function useCurrentTime(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}
