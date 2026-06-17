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
  },
  {
    title: "Experienced Tutors & Coaches",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&h=420&fit=crop",
    alt: "Tutor reading with a student",
    href: "#offering",
  },
  {
    title: "Flexible Scheduling",
    image:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=640&h=420&fit=crop",
    alt: "Calendar showing monthly schedule",
    href: "#offering",
  },
] as const;

function ServiceCard({
  title,
  image,
  alt,
  href,
  className,
}: {
  title: string;
  image: string;
  alt: string;
  href: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex min-h-[420px] flex-col overflow-hidden rounded-[28px] bg-brand-purple p-md sm:min-h-[460px] sm:p-lg",
        className,
      )}
    >
      {/* top-right notch */}
      <div
        aria-hidden
        className="absolute right-0 top-0 h-[4.5rem] w-[4.5rem] rounded-bl-[100%] bg-marketing-bg"
      />

      <Link
        href={href}
        className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange text-white shadow-md transition-transform group-hover:scale-105"
        aria-label={`Learn more about ${title}`}
      >
        <ArrowUpRight className="h-5 w-5" strokeWidth={2.5} />
      </Link>

      <h3 className="relative z-[1] max-w-[75%] pr-14 font-display text-heading-sm font-bold leading-snug text-white sm:text-[1.35rem]">
        {title}
      </h3>

      <div className="relative mt-md flex-1 overflow-hidden rounded-2xl sm:mt-lg">
        <Image
          src={image}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
    </article>
  );
}

export function MarketingServices() {
  return (
    <section id="services" className="bg-marketing-bg py-section lg:py-24">
      <div className="container-content">
        <div className="grid items-end gap-xl lg:grid-cols-2 lg:gap-xxl">
          <div className="min-w-0">
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

          <p className="marketing-lead min-w-[16rem] lg:max-w-md lg:justify-self-end lg:pb-2 lg:text-left">
            Learn how our homeschooling services provide personalized, flexible learning tailored to
            your child&apos;s needs, all from the comfort of home!
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
