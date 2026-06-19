import Link from "next/link";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const SOCIAL_PILLS = [
  { label: "Vimeo", dark: false, className: "left-[4%] top-[22%] -rotate-[7deg]" },
  { label: "Facebook", dark: true, className: "left-[18%] top-[48%] rotate-[4deg]" },
  { label: "LinkedIn", dark: true, className: "left-[34%] top-[18%] -rotate-[3deg]" },
  { label: "Pinterest", dark: false, className: "left-[48%] top-[52%] rotate-[6deg]" },
  { label: "Instagram", dark: false, className: "right-[28%] top-[20%] -rotate-[5deg]" },
  { label: "Twitter", dark: true, className: "right-[14%] top-[44%] rotate-[3deg]" },
  { label: "YouTube", dark: true, className: "right-[2%] top-[24%] -rotate-[4deg]" },
] as const;

function ConsultBadge({
  variant,
  className,
  reverse,
}: {
  variant: "brand" | "light";
  className?: string;
  reverse?: boolean;
}) {
  const isBrand = variant === "brand";

  return (
    <div
      className={cn(
        "relative flex h-[88px] w-[88px] items-center justify-center sm:h-[100px] sm:w-[100px]",
        className,
      )}
    >
      <svg
        viewBox="0 0 200 200"
        className={cn(
          "absolute inset-0 h-full w-full",
          reverse
            ? "animate-[spin_22s_linear_infinite_reverse]"
            : "animate-[spin_18s_linear_infinite]",
        )}
        aria-hidden
      >
        <defs>
          <path
            id={`consult-ring-${variant}-${reverse ? "r" : "f"}`}
            d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
            fill="none"
          />
        </defs>
        <text
          fill="currentColor"
          fontSize="13"
          fontWeight="600"
          letterSpacing="3"
          className={isBrand ? "text-brand-purple" : "text-brand-orange"}
        >
          <textPath
            href={`#consult-ring-${variant}-${reverse ? "r" : "f"}`}
            startOffset="0"
          >
            CONSULT WITH US • CONSULT WITH US • CONSULT WITH US •
          </textPath>
        </text>
      </svg>

      <div
        className={cn(
          "relative z-[1] flex h-11 w-11 items-center justify-center rounded-full shadow-float sm:h-12 sm:w-12",
          isBrand ? "bg-brand-purple text-white" : "bg-white text-brand-purple",
        )}
      >
        <UserRound className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
      </div>
    </div>
  );
}

function SocialPill({ label, dark }: { label: string; dark: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] sm:text-xs",
        dark
          ? "border-brand-purple bg-brand-purple text-white shadow-marketing"
          : "border-brand-purple/15 bg-white text-brand-purple shadow-sm",
      )}
    >
      {label}
    </span>
  );
}

export function AboutContactCta() {
  const year = new Date().getFullYear();

  return (
    <section className="bg-marketing-bg pb-section lg:pb-24" aria-labelledby="about-contact-heading">
      {/* Scattered social pills + consult badges */}
      <div className="container-content max-w-[1400px] py-14 lg:py-16">
        <div className="flex flex-wrap items-center justify-center gap-3 md:hidden">
          {SOCIAL_PILLS.map(({ label, dark }) => (
            <SocialPill key={label} label={label} dark={dark} />
          ))}
        </div>

        <div className="relative mx-auto hidden min-h-[300px] max-w-4xl md:block lg:min-h-[340px]">
          <ConsultBadge variant="brand" reverse className="absolute left-[2%] top-[38%]" />
          <ConsultBadge variant="light" className="absolute right-[4%] top-[32%]" />
          <ConsultBadge variant="brand" className="absolute left-[38%] top-[8%] hidden lg:flex" />

          {SOCIAL_PILLS.map(({ label, dark, className }) => (
            <div key={label} className={cn("absolute z-[1]", className)}>
              <SocialPill label={label} dark={dark} />
            </div>
          ))}
        </div>
      </div>

      {/* Branded contact banner — same width as other about sections */}
      <div className="container-content max-w-[1400px]">
        <div className="relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem]">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple via-brand-purple to-surface-indigo" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(255 255 255 / 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.12) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-orange/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-brand-blue/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-pink/15 blur-3xl"
          />
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-[55%] text-white/[0.07] lg:w-[45%]"
            viewBox="0 0 520 340"
            preserveAspectRatio="none"
          >
            <path d="M80 0C200 24 340 48 520 120V340H0V0H80Z" fill="currentColor" />
            <path
              d="M180 0C300 64 420 88 520 180V340H120V0H180Z"
              fill="currentColor"
              opacity="0.65"
            />
          </svg>

          <div className="relative text-white">
            <div className="border-b border-white/15 px-6 sm:px-8 lg:px-10">
              <div className="grid grid-cols-1 gap-3 py-5 text-[0.65rem] leading-relaxed text-white/70 sm:grid-cols-3 sm:gap-4 sm:text-[0.7rem]">
                <p className="text-center sm:text-left">
                  We Invite You To Contact Our
                  <br />
                  Team For More Information.
                </p>
                <p className="text-center font-semibold uppercase tracking-[0.12em] text-brand-yellow">
                  Let&apos;s Stay Connected
                </p>
                <p className="text-center sm:text-right">©{year} All Right Reserved</p>
              </div>
            </div>

            <div className="overflow-hidden px-6 pb-8 pt-4 sm:px-8 sm:pb-10 lg:px-10">
              <Link
                href="/contact"
                id="about-contact-heading"
                className="block select-none text-center font-display text-[clamp(2rem,5.5vw,3.75rem)] font-black uppercase leading-[0.95] tracking-[-0.03em] text-white transition-opacity hover:opacity-90"
              >
                CONTACTS{" "}
                <span aria-hidden className="inline-block translate-y-[-0.06em] text-brand-yellow">
                  ✦
                </span>{" "}
                US
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
