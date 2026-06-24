"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import { UserRole } from "@/shared";
import { cn } from "@/lib/utils";
import {
  filterNavbarSearchItems,
  getNavbarSearchItems,
  type NavbarSearchItem,
} from "./navbar-search-items";

export function NavbarSearch() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const allItems = useMemo(() => getNavbarSearchItems(role), [role]);
  const results = useMemo(
    () => filterNavbarSearchItems(allItems, query),
    [allItems, query],
  );

  const navigate = useCallback(
    (item: NavbarSearchItem) => {
      setQuery("");
      setOpen(false);
      setActiveIndex(0);
      router.push(item.path);
    },
    [router],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, results.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) {
        navigate(target);
      }
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = open && results.length > 0;

  return (
    <div ref={containerRef} className="relative w-[200px] sm:w-[260px]">
      <label className="relative block">
        <span className="sr-only">Search dashboard</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search pages, chats…"
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="navbar-search-results"
          aria-autocomplete="list"
          aria-activedescendant={
            showDropdown && results[activeIndex] ? `navbar-search-${results[activeIndex].id}` : undefined
          }
          className="h-11 w-full rounded-full border border-sidebar-border bg-sidebar-accent py-2.5 pl-4 pr-11 text-sm text-sidebar-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <Search
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </label>

      {showDropdown ? (
        <div
          id="navbar-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[min(360px,60vh)] overflow-y-auto rounded-2xl border border-border bg-popover p-2 shadow-float"
        >
          <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {query.trim() ? "Results" : "Suggestions"}
          </p>
          <ul className="space-y-0.5">
            {results.map((item, index) => (
              <li key={item.id} role="presentation">
                <button
                  id={`navbar-search-${item.id}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigate(item)}
                  className={cn(
                    "flex w-full flex-col rounded-xl px-3 py-2.5 text-left transition-colors",
                    index === activeIndex
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-popover-foreground hover:bg-muted/60",
                  )}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.description ? (
                    <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 border-t border-border px-3 pt-2 text-[11px] text-muted-foreground">
            ↑↓ navigate · Enter open · Esc close · Ctrl+K focus
          </p>
        </div>
      ) : null}

      {open && query.trim() && results.length === 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-border bg-popover p-4 shadow-float">
          <p className="text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
        </div>
      ) : null}
    </div>
  );
}
