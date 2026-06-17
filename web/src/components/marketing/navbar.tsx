"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { MarketingLogo } from "./logo";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Offering", href: "#offering" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Article", href: "#article" },
] as const;

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-marketing-grid/80 bg-marketing-bg/95 backdrop-blur-md">
      <div className="container-content grid h-[72px] grid-cols-[1fr_auto_1fr] items-center gap-md">
        <Link href="/" className="justify-self-start">
          <MarketingLogo />
        </Link>

        <nav className="hidden items-center justify-center gap-xxl lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="marketing-nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-sm">
          <Link href="/register" className="btn-pill-orange hidden sm:inline-flex">
            Get Started!
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-marketing-text lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-marketing-grid bg-marketing-bg py-md lg:hidden" aria-label="Mobile">
          <ul className="container-content flex flex-col gap-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-sm py-sm type-link font-medium text-marketing-text hover:bg-marketing-grid/40"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/register"
                className="btn-pill-orange mt-sm w-full text-center"
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
