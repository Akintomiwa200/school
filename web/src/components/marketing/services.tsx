import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    title: "Personalized Learning Plans",
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=640&h=420&fit=crop",
    alt: "Brainstorm notes and learning plan on a wall",
    href: "#offering",
    notchMirrored: true,
  },
  {
    title: "Experienced Tutors & Coaches",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&h=420&fit=crop",
    alt: "Tutor reading with a student",
    href: "#offering",
    notchMirrored: true,
  },
  {
    title: "Flexible Scheduling",
    image:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=640&h=420&fit=crop",
    alt: "Calendar showing monthly schedule",
    href: "#offering",
    notchMirrored: false,
  },
] as const;

function ServiceCardNotch({ mirrored }: { mirrored: boolean }) {
  return (
    <svg
      viewBox="0 0 320 108"
      className={cn("h-full w-full", mirrored && "-scale-x-100")}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M0,0 H320 V18 C268,18 228,42 188,62 C148,82 108,96 68,92 C38,88 18,48 0,28 Z"
      />
    </svg>
  );
}

function ServiceCardAction({ href, title }: { href: string; title: string }) {
  return (
    <div className="absolute right-0 top-0 z-20 size-[4.5rem] sm:size-[4.875rem]">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full bg-marketing-bg"
      />
      <Link
        href={href}
        className="absolute left-1/2 top-1/2 flex size-[3.25rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-orange text-white shadow-[0_4px_14px_rgba(255,159,28,0.35)] transition-transform group-hover:scale-105 sm:size-14"
        aria-label={`Learn more about ${title}`}
      >
        <ArrowUpRight className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={2.25} />
      </Link>
    </div>
  );
}

function ServiceCard({
  title,
  image,
  alt,
  href,
  notchMirrored,
  className,
}: {
  title: string;
  image: string;
  alt: string;
  href: string;
  notchMirrored: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex min-h-[440px] flex-col overflow-hidden rounded-[32px] bg-brand-purple px-5 pb-5 pt-7 sm:min-h-[500px] sm:px-6 sm:pb-6 sm:pt-8",
        className,
      )}
    >
      <ServiceCardAction href={href} title={title} />

      <h3 className="relative z-[1] max-w-[10.5rem] pr-[4.75rem] font-display text-[1.3125rem] font-bold leading-[1.22] text-white sm:max-w-[11.5rem] sm:pr-[5.25rem] sm:text-[1.4375rem]">
        {title}
      </h3>

      <div className="relative mt-7 flex flex-1 flex-col sm:mt-8">
        <div
          aria-hidden
          className="pointer-events-none relative z-10 h-20 shrink-0 text-brand-purple sm:h-[5.5rem]"
        >
          <ServiceCardNotch mirrored={notchMirrored} />
        </div>

        <div className="relative -mt-12 min-h-[200px] flex-1 overflow-hidden rounded-[20px] sm:-mt-14 sm:min-h-[230px]">
          <Image
            src={image}
            alt={alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </div>
    </article>
  );
}

export function MarketingServices() {
  return (
    <section id="services" className="bg-marketing-bg py-section lg:py-24">
      <div className="container-content">
        <div className="grid items-end gap-xl lg:grid-cols-2 lg:gap-xxl">
          <div>
            <span className="section-badge">Our Services</span>

            <h2 className="marketing-section-title mt-md text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem]">
              How Our{" "}
              <span className="relative inline-block">
                <Sparkles className="absolute -top-5 left-1/2 h-5 w-5 -translate-x-1/2 fill-brand-purple/20 text-brand-purple" />
                <span className="squiggle-underline">Homeschooling</span>
              </span>{" "}
              Services Work
            </h2>
          </div>

          <p className="marketing-lead-sm max-w-[34rem] lg:max-w-none lg:justify-self-end lg:pb-2 lg:text-left">
            Learn how our homeschooling services provide personalized, flexible
            learning tailored to your child&apos;s needs, all from the comfort of
            home!
          </p>
        </div>

        <div className="mt-section grid gap-xl md:grid-cols-2 lg:mt-xxl lg:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
