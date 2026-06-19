import type { ReactNode } from "react";
import Link from "next/link";
import {
  Crown,
  Play,
  Sparkles,
} from "lucide-react";
import {
  HeroStudentLeft,
  HeroStudentMobile,
  HeroStudentRight,
} from "./hero-students";

export function MarketingHero() {
  return (
    <section className="marketing-oval-grid-bg min-h-[90vh]">
      <div className="container-content relative flex min-h-[90vh] flex-col justify-center pb-section pt-xl lg:pb-28 lg:pt-16">
        {/* Crown — centered above heading */}
        <div className="pointer-events-none absolute left-1/2 top-8 hidden -translate-x-[160px] text-brand-purple lg:block">
          <Crown className="h-7 w-7 fill-brand-purple/15" />
        </div>
        {/* Sparkles — top right */}
        <div className="pointer-events-none absolute right-[14%] top-10 hidden text-brand-orange lg:block">
          <Sparkles className="h-6 w-6" />
        </div>

        <div className="flex flex-col items-center gap-xl lg:flex-row lg:items-end lg:justify-center lg:gap-8 xl:gap-12">
          {/* Left student */}
          <div className="order-2 hidden lg:order-1 lg:flex lg:justify-end">
            <HeroStudentLeft />
          </div>

          {/* Center copy */}
          <div className="order-1 w-full max-w-[38rem] shrink-0 text-center lg:order-2 lg:pb-6">
            <h1 className="marketing-section-title text-[1.9rem] sm:text-[2.5rem] lg:text-[3rem]">
              Shaping Future Innovators with{" "}
              <span className="squiggle-underline">Personalized Learning</span>
            </h1>

            {/* Mobile: student visuals between headline and lead */}
            <div className="mt-lg flex w-full items-end justify-center gap-0 overflow-visible px-1 sm:gap-2 lg:hidden">
              <HeroStudentMobile>
                <HeroStudentLeft />
              </HeroStudentMobile>
              <HeroStudentMobile>
                <HeroStudentRight />
              </HeroStudentMobile>
            </div>

            {/* Lead row: 4-pointed star + text inline */}
            <div className="relative mt-lg flex items-start justify-center gap-2 px-2">
              <span
                aria-hidden
                className="mt-1 shrink-0 text-xl leading-none text-brand-pink"
                style={{ fontFamily: "serif" }}
              >
                ✦
              </span>
              <p className="marketing-lead max-w-[32rem] text-left sm:text-center">
                Discover flexible, engaging, and expert-led homeschooling
                services that put your child&apos;s learning first.
              </p>
            </div>

            <div className="mt-section flex justify-center">
              <Link href="/register" className="btn-pill-purple gap-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Play className="h-4 w-4 fill-white text-white" />
                </span>
                Watch Introduction
              </Link>
            </div>
          </div>

          {/* Right student */}
          <div className="order-3 hidden lg:order-3 lg:flex lg:justify-start">
            <HeroStudentRight />
          </div>
        </div>
      </div>
    </section>
  );
}
