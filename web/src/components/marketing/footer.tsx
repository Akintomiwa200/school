import Link from "next/link";
import { appConfig } from "@/config";
import { MarketingLogo } from "./logo";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from "./social-icons";

const FOOTER_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Offering", href: "#offering" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Article", href: "#article" },
] as const;

const DESKTOP_SOCIAL = [
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedinIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YoutubeIcon },
] as const;

const MOBILE_SOCIAL = [
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "Twitter", href: "https://twitter.com", icon: TwitterIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YoutubeIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedinIcon },
] as const;

function FooterLinkSeparator() {
  return <span className="px-2 text-marketing-muted">|</span>;
}

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer>
      {/* Mobile — stacked layout, site surface background */}
      <div className="lg:hidden">
        <div className="rounded-b-[32px] bg-marketing-bg px-6 pb-10 pt-5 text-marketing-text">
          <div className="border-t border-marketing-grid pt-6">
            <div className="flex items-center justify-center gap-4">
              {MOBILE_SOCIAL.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-marketing-grid text-marketing-muted transition-colors hover:bg-marketing-grid/80 hover:text-marketing-text [&_svg]:h-4 [&_svg]:w-4"
                >
                  <Icon />
                </a>
              ))}
            </div>

            <p className="mt-6 text-center text-sm font-medium leading-relaxed text-marketing-text">
              <Link href={FOOTER_LINKS[0].href} className="hover:text-brand-purple">
                {FOOTER_LINKS[0].label}
              </Link>
              <FooterLinkSeparator />
              <Link href={FOOTER_LINKS[1].href} className="hover:text-brand-purple">
                {FOOTER_LINKS[1].label}
              </Link>
              <FooterLinkSeparator />
              <Link href={FOOTER_LINKS[2].href} className="hover:text-brand-purple">
                {FOOTER_LINKS[2].label}
              </Link>
              <FooterLinkSeparator />
            </p>

            <p className="mt-3 text-center text-sm font-medium">
              <Link href={FOOTER_LINKS[3].href} className="hover:text-brand-purple">
                {FOOTER_LINKS[3].label}
              </Link>
            </p>

            <p className="mt-3 text-center text-sm font-medium">
              <Link href="/privacy" className="hover:text-brand-purple">
                Policy
              </Link>
              <span className="px-1.5 text-marketing-muted">&amp;</span>
              <Link href="/terms" className="hover:text-brand-purple">
                Terms &amp; Condition
              </Link>
            </p>

            <p className="mt-6 text-center text-sm text-marketing-muted">
              &copy; {appConfig.name} {year}. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
      {/* Desktop — unchanged */}
      <div className="hidden bg-marketing-bg py-section lg:block lg:py-24">
        <div className="container-content">
          <div className="flex flex-col gap-xl lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link href="/">
                <MarketingLogo />
              </Link>

              <div className="mt-lg flex items-center gap-sm">
                {DESKTOP_SOCIAL.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-marketing-grid text-marketing-muted transition-colors hover:bg-marketing-grid/80 hover:text-marketing-text"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-x-xl gap-y-sm">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="marketing-nav-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-xxl flex flex-col gap-md border-t border-marketing-grid pt-xl type-link-sm text-marketing-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {appConfig.name} {year}. All Rights Reserved.
            </p>
            <div className="flex flex-wrap gap-x-lg gap-y-sm">
              <Link href="/privacy" className="hover:text-marketing-text">
                Policy
              </Link>
              <Link href="/terms" className="hover:text-marketing-text">
                Terms &amp; Condition
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
