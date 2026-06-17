import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Apple,
  BookOpen,
  Crown,
  Lightbulb,
  Pencil,
  Play,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

function FloatingIcon({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl bg-marketing-bg shadow-float",
        className,
      )}
    >
      {children}
    </div>
  );
}

function HeroStudentLeft() {
  return (
    <div className="relative mx-auto h-[340px] w-[280px] shrink-0">
      <div className="absolute bottom-8 left-0 h-44 w-36 rounded-2xl bg-brand-orange" />
      <div className="absolute bottom-16 left-10 h-52 w-52 rounded-full bg-brand-blue/90" />
      <div className="absolute bottom-6 left-14 h-64 w-48 overflow-hidden rounded-[2rem]">
        <Image
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=520&fit=crop"
          alt="Student with laptop"
          fill
          className="object-cover object-top"
          sizes="192px"
          priority
        />
      </div>
      <FloatingIcon className="absolute left-0 top-16 text-brand-purple">
        <BookOpen className="h-5 w-5" />
      </FloatingIcon>
      <FloatingIcon className="absolute bottom-28 right-0 text-red-500">
        <Apple className="h-5 w-5" />
      </FloatingIcon>
    </div>
  );
}

function HeroStudentRight() {
  return (
    <div className="relative mx-auto h-[340px] w-[280px] shrink-0">
      <svg
        viewBox="0 0 260 320"
        className="absolute inset-0 h-full w-full text-brand-purple"
        aria-hidden
      >
        <path
          d="M40 40C90 0 170 0 220 40C250 65 255 120 230 170C205 220 150 280 130 300C110 280 55 220 30 170C5 120 10 65 40 40Z"
          fill="currentColor"
        />
      </svg>
      <div className="absolute bottom-8 left-10 h-64 w-48 overflow-hidden rounded-[2rem]">
        <Image
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=520&fit=crop"
          alt="Student with books"
          fill
          className="object-cover object-top"
          sizes="192px"
          priority
        />
      </div>
      <FloatingIcon className="absolute right-2 top-20 text-brand-orange">
        <Lightbulb className="h-5 w-5 fill-brand-orange/20" />
      </FloatingIcon>
      <FloatingIcon className="absolute bottom-32 left-0 text-yellow-500">
        <Pencil className="h-5 w-5" />
      </FloatingIcon>
    </div>
  );
}

export function MarketingHero() {
  return (
    <section className="marketing-grid-bg relative min-h-[90vh]">
      <div className="container-content relative flex min-h-[90vh] flex-col justify-center pb-section pt-xl lg:pb-28 lg:pt-16">
        <div className="pointer-events-none absolute left-[12%] top-8 hidden text-brand-purple lg:block">
          <Crown className="h-7 w-7 fill-brand-purple/15" />
        </div>
        <div className="pointer-events-none absolute right-[14%] top-10 hidden text-brand-orange lg:block">
          <Sparkles className="h-7 w-7" />
        </div>

        {/* flex + shrink-0 center — prevents side images from crushing copy */}
        <div className="flex flex-col items-center gap-xl lg:flex-row lg:items-center lg:justify-center lg:gap-8 xl:gap-12">
          <div className="order-2 hidden lg:order-1 lg:flex lg:justify-end">
            <HeroStudentLeft />
          </div>

          <div className="order-1 w-full max-w-[42rem] shrink-0 text-center lg:order-2">
            <h1 className="marketing-section-title text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem]">
              Shaping Future Innovators with{" "}
              <span className="squiggle-underline">Personalized Learning</span>
            </h1>

            <div className="relative mt-lg px-2">
              <Star
                aria-hidden
                className="absolute -left-1 top-1 hidden h-5 w-5 fill-brand-pink text-brand-pink sm:-left-6 sm:block"
              />
              <p className="marketing-lead mx-auto max-w-[36rem]">
                Discover flexible, engaging, and expert-led homeschooling services that put your
                child&apos;s learning first.
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

          <div className="order-3 hidden lg:order-3 lg:flex lg:justify-start">
            <HeroStudentRight />
          </div>
        </div>

        <div className="mt-xl grid grid-cols-2 gap-md lg:hidden">
          <HeroStudentLeft />
          <HeroStudentRight />
        </div>
      </div>
    </section>
  );
}
