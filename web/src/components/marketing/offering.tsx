"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import {
  Check,
  FileText,
  MessageCircle,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FrameColor = "purple" | "orange";

type OfferingFeature = {
  label: string;
  title: string;
  description: string;
  items: string[];
  image: string;
  alt: string;
  frame: FrameColor;
  reverse?: boolean;
  overlays: ReactNode;
  doodles?: ReactNode;
};

const FEATURES: OfferingFeature[] = [
  {
    label: "One on One Tutoring",
    title: "Personalized Sessions for Every Subject",
    description:
      "Get personalized sessions with experienced tutors for every subject, from math to language arts, tailored to meet your child's individual learning needs, all managed through an interactive dashboard for real-time tracking and progress monitoring.",
    items: [
      "Personalized Learning",
      "Expert Tutors",
      "Subject Variety",
      "Interactive Dashboard",
    ],
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=720&h=560&fit=crop",
    alt: "Tutor in a one-on-one online session with headset",
    frame: "purple",
    overlays: <TutoringOverlays />,
    doodles: (
      <>
        <Sparkles className="absolute -right-1 top-8 z-20 h-5 w-5 text-brand-orange lg:top-10 lg:h-7 lg:w-7" />
        <Sparkles className="absolute -left-1 bottom-24 z-20 h-4 w-4 text-brand-orange lg:-left-2 lg:bottom-28 lg:h-6 lg:w-6" />
        <Sparkles className="absolute right-6 top-1 z-20 hidden h-5 w-5 text-brand-orange/80 lg:block lg:right-8 lg:top-2" />
      </>
    ),
  },
  {
    label: "Flexible Scheduling",
    title: "Learn at a Pace That Works for You",
    description:
      "There's no rush! You can take breaks, go back to things you enjoy, and spend as much time as you need on each lesson.",
    items: [
      "Flexible Learning Flow",
      "Relaxed Learning Mode",
      "Personalized Learning Journey",
      "Pause/Repeat",
    ],
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=720&h=560&fit=crop",
    alt: "Hands on a laptop with coffee — flexible study setup",
    frame: "orange",
    reverse: true,
    overlays: <ScheduleOverlays />,
    doodles: (
      <>
        <div
          aria-hidden
          className="absolute -top-2 right-6 h-6 w-6 rounded-full bg-brand-blue/30 blur-[1px] lg:-top-4 lg:right-10 lg:h-8 lg:w-8"
        />
        <svg
          aria-hidden
          className="absolute -bottom-1 right-2 h-6 w-14 text-green lg:-bottom-2 lg:right-4 lg:h-8 lg:w-20"
          viewBox="0 0 80 20"
          fill="none"
        >
          <path
            d="M4 12C16 4 28 16 40 8C52 0 64 14 76 6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </>
    ),
  },
  {
    label: "Interactive Lessons",
    title: "Fun and Engaging Learning Tools",
    description:
      "Our platform uses interactive lessons and cool resources like games and quizzes to keep your child engaged and excited while learning new things.",
    items: [
      "Interactive Lessons",
      "Quizzes and Assessments",
      "Visual Learning",
      "Gamified Resources",
    ],
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=720&h=560&fit=crop",
    alt: "Child learning on a laptop with colorful interface",
    frame: "purple",
    overlays: <LessonsOverlays />,
    doodles: (
      <>
        <Star className="absolute -left-1 top-10 h-4 w-4 fill-brand-orange/30 text-brand-orange lg:-left-2 lg:top-12 lg:h-5 lg:w-5" />
        <svg
          aria-hidden
          className="absolute -right-1 bottom-16 h-8 w-8 text-brand-purple/80 lg:-right-2 lg:bottom-20 lg:h-12 lg:w-12"
          viewBox="0 0 48 48"
          fill="none"
        >
          <path
            d="M8 24C16 12 24 36 32 16C36 26 40 20 44 28"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </>
    ),
  },
];

function TutoringOverlays() {
  const statusRows = [
    { label: "Subject Planned", dot: "bg-brand-blue" },
    { label: "Subject On Progress", dot: "bg-brand-yellow" },
    { label: "Subject Finished", dot: "bg-green" },
  ] as const;

  return (
    <>
      {/* Status card — sits on left frame edge, not over the photo */}
      <div className="absolute left-0 top-[6%] z-30 w-[8.25rem] rounded-2xl bg-marketing-bg p-2.5 shadow-float lg:top-[12%] lg:-left-11 lg:w-40 lg:p-3">
        <ul className="space-y-2">
          {statusRows.map(({ label, dot }) => (
            <li key={label} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", dot)} />
                <span className="truncate text-[10px] font-medium text-marketing-text sm:text-[11px]">
                  {label}
                </span>
              </span>
              <Plus className="h-3 w-3 shrink-0 text-brand-purple" strokeWidth={2.5} />
            </li>
          ))}
        </ul>
      </div>

      {/* Task card — straddles bottom frame edge */}
      <div className="absolute -bottom-5 left-1/2 z-30 w-[11.25rem] max-w-[calc(100%-1rem)] -translate-x-1/2 rounded-2xl bg-marketing-bg p-2.5 shadow-float lg:-bottom-9 lg:w-[88%] lg:max-w-[15.5rem] lg:p-3">
        <span className="inline-block rounded-md bg-brand-pink/15 px-2 py-0.5 text-[10px] font-semibold text-brand-pink">
          Science
        </span>
        <p className="mt-2 text-[11px] font-bold leading-snug text-marketing-text sm:text-xs">
          Challenge 1: Anatomy Research
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-marketing-muted">
          Complete the diagram and label key organs for your assignment.
        </p>
        <div className="mt-2.5 flex items-center gap-3 text-brand-purple/70">
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
          <FileText className="h-3.5 w-3.5" strokeWidth={2} />
        </div>
      </div>
    </>
  );
}

function ScheduleOverlays() {
  return (
    <div className="absolute -bottom-4 left-1 right-1 z-30 rounded-2xl bg-marketing-bg p-3 shadow-float lg:-bottom-8 lg:left-8 lg:right-auto lg:w-64 lg:p-4">
      <p className="text-sm font-bold text-brand-purple">Schedule</p>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[9px] text-marketing-muted">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span
            key={`${d}-${i}`}
            className={i === 2 ? "font-bold text-brand-purple" : ""}
          >
            {d}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {["Biology", "Mathematics", "English"].map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-brand-purple/10 px-2 py-0.5 text-[10px] font-medium text-brand-purple"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function LessonsOverlays() {
  return (
    <>
      <div className="absolute left-0 top-[6%] z-30 w-[9rem] rounded-xl bg-marketing-bg p-2.5 shadow-float lg:top-[8%] lg:-left-10 lg:w-40 lg:p-3">
        <p className="text-xs font-bold text-brand-purple">Sport Quiz</p>
        <div className="mt-2 flex gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange/15 text-sm">
            ⚽
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/15 text-sm">
            🏀
          </span>
        </div>
      </div>
      <div className="absolute -bottom-5 right-0 z-30 w-[9.5rem] rounded-xl bg-marketing-bg p-2.5 shadow-float lg:-bottom-9 lg:-right-8 lg:w-44 lg:p-3">
        <p className="text-[11px] font-bold text-brand-purple">Statistics Math Quiz</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-purple/15">
          <div className="h-full w-3/4 rounded-full bg-brand-purple" />
        </div>
        <p className="mt-1 text-[10px] text-marketing-muted">12 / 15 correct</p>
      </div>
    </>
  );
}

function BlobFrame({
  color,
  children,
  className,
  tilt,
}: {
  color: FrameColor;
  children: ReactNode;
  className?: string;
  tilt?: "left" | "right";
}) {
  const tiltClass =
    tilt === "left"
      ? "max-lg:rotate-0 lg:-rotate-[3deg]"
      : tilt === "right"
        ? "max-lg:rotate-0 lg:rotate-[3deg]"
        : "";

  return (
    <div
      className={cn(
        "relative p-2 lg:p-4",
        tiltClass,
        color === "purple" ? "text-brand-purple" : "text-brand-orange",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          "rounded-[1.75rem] rounded-br-[3rem] rounded-tl-[2.5rem] lg:rounded-[2.5rem] lg:rounded-br-[4rem] lg:rounded-tl-[3.5rem]",
          "border-[8px] border-current lg:border-[12px]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function FeatureChecklist({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 grid grid-cols-1 gap-2.5 lg:mt-6 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-4">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-3 text-sm text-marketing-text max-lg:mx-auto max-lg:w-fit lg:mx-0"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-purple/10">
            <Check className="h-3.5 w-3.5 text-brand-purple" strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function OfferingFeatureRow({
  label,
  title,
  description,
  items,
  image,
  alt,
  frame,
  reverse,
  overlays,
  doodles,
}: OfferingFeature) {
  const frameContent = (
    <div className="relative aspect-[4/3] w-full">
      <Image
        src={image}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 90vw, 480px"
      />
    </div>
  );

  const media = (
    <div className="relative mx-auto w-full max-w-[19rem] px-1 lg:max-w-none lg:px-0">
      {doodles}
      <div className="relative pb-10 pt-3 lg:pb-10 lg:pt-8">
        <BlobFrame color={frame} tilt={reverse ? "right" : "left"}>
          {frameContent}
        </BlobFrame>
        {overlays}
      </div>
    </div>
  );

  const copy = (
    <div className="flex flex-col justify-center max-lg:text-center lg:text-left">
      <p
        className={cn(
          "text-[11px] font-bold uppercase tracking-[0.14em] lg:text-xs",
          frame === "orange" ? "text-brand-orange" : "text-brand-pink",
        )}
      >
        {label}
      </p>
      <h3 className="mt-2 font-display text-[1.375rem] font-bold leading-tight text-marketing-text lg:text-[2rem]">
        {title}
      </h3>
      <p className="marketing-lead mt-3 max-lg:text-base lg:mt-4">{description}</p>
      <FeatureChecklist items={items} />
    </div>
  );

  return (
    <div
      className={cn(
        "marketing-oval-grid-bg marketing-oval-grid-bg--row rounded-[1.25rem] px-4 py-8 max-lg:overflow-x-clip lg:rounded-[2.5rem] lg:px-10 lg:py-16",
        "grid items-center gap-6 lg:grid-cols-2 lg:gap-12",
        reverse && "lg:[&>*:first-child]:order-2",
      )}
    >
      {media}
      {copy}
    </div>
  );
}

export function MarketingOffering() {
  return (
    <section id="offering" className="overflow-x-clip bg-marketing-bg py-10 lg:overflow-visible lg:py-24">
      <div className="mx-auto w-full max-w-content px-4 lg:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-badge">What We Offer</span>
          <h2 className="marketing-section-title mt-4 text-[1.625rem] sm:text-[2rem] lg:text-[2.75rem]">
            Explore Our <span className="squiggle-underline">Learning</span>{" "}
            Solution
          </h2>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:mt-16 lg:gap-20">
          {FEATURES.map((feature) => (
            <OfferingFeatureRow key={feature.label} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
