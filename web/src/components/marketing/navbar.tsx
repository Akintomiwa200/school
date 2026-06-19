"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingLogo } from "./logo";
import { MARKETING_NAV_LINKS } from "./nav-links";

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-marketing-bg/95 backdrop-blur-md">
      <div className="container-content flex h-[10vh] min-h-[3.5rem] items-center justify-between gap-md">
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
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-marketing-grid/60 bg-marketing-bg py-md xl:hidden" aria-label="Mobile">
          <ul className="container-content flex flex-col gap-sm">
            {MARKETING_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block rounded-lg px-sm py-sm text-[15px] font-medium hover:bg-marketing-grid/40",
                    pathname === link.href ? "text-brand-purple" : "text-marketing-text",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/register"
                className="mt-sm block w-full rounded-full bg-brand-orange py-[10px] text-center text-[15px] font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                Get Started!
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
