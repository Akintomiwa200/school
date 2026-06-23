"use client";

import { useEffect } from "react";

const HIDE_DELAY_MS = 900;

function isScrollable(element: HTMLElement) {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

function markScrolling(target: EventTarget | null, timeouts: Map<EventTarget, ReturnType<typeof setTimeout>>) {
  if (!(target instanceof HTMLElement)) return;

  const element =
    target === document.body || target === document.documentElement
      ? document.documentElement
      : target;

  if (element !== document.documentElement && !isScrollable(element)) return;

  element.classList.add("is-scrolling");

  const existing = timeouts.get(element);
  if (existing) clearTimeout(existing);

  timeouts.set(
    element,
    setTimeout(() => {
      element.classList.remove("is-scrolling");
      timeouts.delete(element);
    }, HIDE_DELAY_MS),
  );
}

export function ScrollbarBehavior() {
  useEffect(() => {
    const timeouts = new Map<EventTarget, ReturnType<typeof setTimeout>>();

    const onScroll = (event: Event) => {
      markScrolling(event.target, timeouts);
    };

    window.addEventListener("scroll", onScroll, { capture: true, passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      for (const timeout of timeouts.values()) clearTimeout(timeout);
      timeouts.clear();
      document.documentElement.classList.remove("is-scrolling");
      document.querySelectorAll(".is-scrolling").forEach((node) => node.classList.remove("is-scrolling"));
    };
  }, []);

  return null;
}
