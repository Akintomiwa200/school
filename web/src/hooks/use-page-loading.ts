"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

/** Simulates page data loading after auth is ready. Replace with real fetch status later. */
export function usePageLoading(delayMs = 500) {
  const { status } = useSession();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === "loading") {
      setReady(false);
      return;
    }

    const timer = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [status, delayMs]);

  return status === "loading" || !ready;
}
