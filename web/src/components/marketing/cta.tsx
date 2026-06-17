import Image from "next/image";
import Link from "next/link";
import { Crown, Sparkles, Star } from "lucide-react";

const CTA_IMAGE = "/marketing/cta-student.png";

export function MarketingCta() {
  return (
    <section className="overflow-visible bg-marketing-bg py-section lg:py-24">
      <div className="container-content overflow-visible">
        <div className="relative overflow-visible rounded-[40px] bg-[#6b21a8]">
          {/* darker wave — right side */}
          <svg
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 top-0 w-[42%] text-[#581c87]"
            viewBox="0 0 400 360"
            preserveAspectRatio="none"
          >
            <path
              d="M60 0C160 20 300 50 400 100V360H0V0H60Z"
              fill="currentColor"
              opacity="0.5"
            />
          </svg>

          {/* fixed-height banner — image anchored to bottom-left */}
          <div className="relative min-h-[320px] overflow-visible lg:min-h-[340px]">
            {/* Desktop: pop-out cutout, feet flush with banner bottom */}
            <div className="pointer-events-none absolute bottom-0 left-6 z-[1] hidden lg:block xl:left-10">
              <Image
                src={CTA_IMAGE}
                width={456}
                height={608}
                alt="Student with books celebrating"
                className="block h-[420px] w-auto max-w-none -translate-y-14 object-contain object-bottom xl:h-[460px] xl:-translate-y-16"
                priority={false}
              />
            </div>

            {/* Mobile / tablet: centered above copy */}
            <div className="flex justify-center pt-6 lg:hidden">
              <Image
                src={CTA_IMAGE}
                width={456}
                height={608}
                alt="Student with books celebrating"
                className="block h-[240px] w-auto object-contain sm:h-[280px]"
                priority={false}
              />
            </div>

            {/* copy — right half on desktop, below image on mobile */}
            <div className="relative z-[2] flex flex-col justify-center px-6 pb-10 pt-4 text-left lg:absolute lg:inset-y-0 lg:right-0 lg:w-[56%] lg:px-10 lg:py-12 xl:px-14">
              <h2 className="max-w-lg font-display text-[1.75rem] font-bold leading-[1.25] text-white sm:text-[2rem] lg:text-[2.25rem]">
                <span className="relative block pl-9">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-0.5 flex flex-col gap-0 text-brand-yellow"
                  >
                    <Sparkles className="h-5 w-5 fill-brand-yellow" />
                    <Sparkles className="ml-3 h-4 w-4 fill-brand-yellow" />
                  </span>
                  Join our growing homeschooling{" "}
                  <span className="relative inline-block">
                    <Crown
                      aria-hidden
                      className="absolute -top-6 left-1/2 h-5 w-5 -translate-x-1/2 fill-brand-yellow/30 text-brand-yellow lg:-top-7 lg:h-6 lg:w-6"
                    />
                    community
                  </span>
                </span>
              </h2>

              <p className="marketing-lead-light mt-5 max-w-lg text-[1.0625rem] leading-[1.65] sm:text-lg">
                Join a vibrant community where you can collaborate, learn, and grow with
                homeschooling partners.
              </p>

              <div className="relative mt-8 inline-flex items-end gap-6">
                <Link href="/register" className="btn-pill-yellow">
                  Join Now!
                </Link>
                <Star
                  aria-hidden
                  className="mb-1 h-6 w-6 shrink-0 text-green-400"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
