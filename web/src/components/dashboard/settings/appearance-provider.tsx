"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAppearanceStore } from "@/store/appearance.store";

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const hydrated = useAppearanceStore((state) => state.hydrated);
  const hydrate = useAppearanceStore((state) => state.hydrate);
  const applyToDocument = useAppearanceStore((state) => state.applyToDocument);
  const appearance = useAppearanceStore((state) => state.appearance);
  const accessibility = useAppearanceStore((state) => state.accessibility);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    applyToDocument(setTheme);
  }, [hydrated, appearance, accessibility, pathname, applyToDocument, setTheme]);

  return children;
}
