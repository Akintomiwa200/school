"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingLogo } from "./logo";
import { MARKETING_NAV_LINKS } from "./nav-links";

function FriesMenuIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn("flex w-5 flex-col items-end justify-center gap-[5px]", className)}
      aria-hidden
    >
      <span className="h-0.5 w-5 rounded-full bg-current" />
      <span className="h-0.5 w-[0.65rem] rounded-full bg-current" />
      <span className="h-0.5 w-5 rounded-full bg-current" />
    </span>
  );
}

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header className="relative sticky top-0 z-50 bg-marketing-bg/95 backdrop-blur-md">
      <div className="relative z-[60] container-content flex h-[10vh] min-h-[3.5rem] items-center justify-between gap-md">
        <Link href="/" className="shrink-0">
          <MarketingLogo />
        </Link>

        <nav className="hidden items-center gap-5 xl:flex xl:gap-7" aria-label="Main">
          {MARKETING_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[14px] font-medium transition-colors xl:text-[15px]",
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "text-brand-purple"
                  : "text-marketing-text hover:text-brand-purple",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-sm">
          <Link
            href="/register"
            className="hidden items-center justify-center rounded-full bg-brand-orange px-[22px] py-[10px] text-[15px] font-semibold text-white transition-transform hover:scale-[1.02] sm:inline-flex"
          >
            Get Started!
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-marketing-text xl:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <FriesMenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 top-[max(3.5rem,10vh)] z-40 bg-marketing-text/25 xl:hidden"
            onClick={() => setOpen(false)}
          />
          <nav
            className="absolute left-0 right-0 top-full z-50 max-h-[calc(100dvh-max(3.5rem,10vh))] min-h-[min(72vh,22rem)] overflow-y-auto border-t border-marketing-grid/60 bg-marketing-bg shadow-marketing xl:hidden"
            aria-label="Mobile"
          >
            <ul className="container-content flex flex-col gap-1 py-6 pb-8">
              {MARKETING_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-lg px-sm py-3.5 text-base font-medium hover:bg-marketing-grid/40",
                      pathname === link.href ? "text-brand-purple" : "text-marketing-text",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-4 border-t border-marketing-grid/60 pt-5">
                <Link
                  href="/register"
                  className="block w-full rounded-full bg-brand-orange py-3.5 text-center text-base font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  Get Started!
                </Link>
              </li>
            </ul>
          </nav>
        </>
      ) : null}
    </header>
  );
}
