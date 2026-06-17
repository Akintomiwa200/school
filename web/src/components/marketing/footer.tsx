import Link from "next/link";
import { appConfig } from "@/config";
import { MarketingLogo } from "./logo";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "./social-icons";

const FOOTER_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Offering", href: "#offering" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Article", href: "#article" },
] as const;

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedinIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YoutubeIcon },
] as const;

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-section lg:py-24 bg-marketing-surface">
      <div className="container-content">
        <div className="flex flex-col gap-xl lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link href="/">
              <MarketingLogo stacked />
            </Link>

            <div className="mt-lg flex items-center gap-sm">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
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
                  <Link
                    href={link.href}
                    className="marketing-nav-link"
                  >
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
    </footer>
  );
}
