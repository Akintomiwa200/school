import Link from "next/link";
import { Crown, Sparkles, Star } from "lucide-react";

import ctaStudent from "../../../public/marketing/cta-student.png";

export function MarketingCta() {
  return (
    <section className="overflow-visible bg-marketing-bg py-section lg:pb-24 lg:pt-20">
      <div className="container-content overflow-visible">
        <div className="relative overflow-visible rounded-[32px] bg-[#6225d1] lg:rounded-[40px] lg:min-h-[340px]">
          {/* Decorative blobs — clipped to banner */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px] lg:rounded-[40px]"
          >
            <svg
              className="absolute inset-y-0 right-0 w-[65%] text-[#4a1ca8] lg:w-[50%]"
              viewBox="0 0 520 340"
              preserveAspectRatio="none"
            >
              <path
                d="M80 0C200 24 340 48 520 120V340H0V0H80Z"
                fill="currentColor"
                opacity="0.5"
              />
              <path
                d="M180 0C300 64 420 88 520 180V340H120V0H180Z"
                fill="currentColor"
                opacity="0.32"
              />
            </svg>
          </div>

          <div className="relative flex flex-col lg:min-h-[340px] lg:flex-row">
            {/* Desktop only — student pop-out */}
            <div className="relative hidden shrink-0 overflow-visible lg:block lg:min-h-[340px] lg:w-[44%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ctaStudent.src}
                alt="Student with books celebrating"
                width={ctaStudent.width}
                height={ctaStudent.height}
                className="cta-student-image absolute bottom-0 left-6 h-[300px] w-auto -translate-y-9 object-contain object-bottom xl:left-8 xl:h-[310px] xl:-translate-y-10"
                decoding="async"
              />
            </div>

            {/* Copy — no shrink / no max-width caps */}
            <div className="relative z-[1] flex w-full shrink-0 flex-col justify-center px-6 py-8 text-left sm:px-8 sm:py-10 lg:w-[56%] lg:flex-none lg:px-10 lg:py-10 lg:pr-12 xl:pr-14">
              <h2 className="font-display text-[1.875rem] font-bold leading-[1.25] text-white sm:text-[2rem] lg:text-[2.25rem]">
                <span className="relative block pl-9 pt-2">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-2 flex flex-col gap-0.5 text-brand-yellow"
                  >
                    <Sparkles className="h-5 w-5 fill-brand-yellow" />
                    <Sparkles className="ml-2.5 h-4 w-4 fill-brand-yellow" />
                  </span>
                  Join our growing homeschooling{" "}
                  <span className="relative inline-block pt-1">
                    <Crown
                      aria-hidden
                      className="absolute -top-4 left-1/2 h-5 w-5 -translate-x-1/2 fill-brand-yellow/25 text-brand-yellow lg:-top-5"
                    />
                    community
                  </span>
                </span>
              </h2>

              <p className="marketing-lead-light mt-5">
                Join a vibrant community where you can collaborate, learn, and grow with
                homeschooling partners.
              </p>

              <div className="mt-8">
                <Star
                  aria-hidden
                  className="mb-3 h-5 w-5 fill-green-400/20 text-green-400"
                  strokeWidth={2}
                />
                <Link href="/register" className="btn-pill-yellow inline-flex">
                  Join Now!
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
