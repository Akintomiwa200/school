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
    <header className="sticky top-0 z-50 bg-marketing-bg/95 backdrop-blur-md">
      <div className="container-content flex h-[10vh] items-center justify-between gap-md">
        {/* Logo — left */}
        <Link href="/" className="shrink-0">
          <MarketingLogo />
        </Link>

        {/* Nav links — center */}
        <nav className="hidden items-center gap-9 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-marketing-text transition-colors hover:text-brand-purple"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA — right */}
        <div className="flex items-center gap-sm">
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-brand-orange px-[22px] py-[10px] text-[15px] font-semibold text-white transition-transform hover:scale-[1.02]"
          >
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

      {/* Mobile menu */}
      {open && (
        <nav
          className="bg-marketing-bg py-md lg:hidden"
          aria-label="Mobile"
        >
          <ul className="container-content flex flex-col gap-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-sm py-sm text-[15px] font-medium text-marketing-text hover:bg-marketing-grid/40"
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
      )}
    </header>
  );
}
