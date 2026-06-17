import type { ReactNode } from "react";
import Image from "next/image";
import { Check, Sparkles, Star } from "lucide-react";
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
      "Connect with experienced tutors who adapt every session to your child's pace, goals, and learning style — from math to music.",
    items: [
      "Personalized Learning",
      "Expert Tutors",
      "Live Feedback",
      "Progress Tracking",
      "Subject Specialists",
      "Safe Online Sessions",
    ],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=720&h=560&fit=crop",
    alt: "Tutor in a one-on-one online session with headset",
    frame: "purple",
    overlays: <TutoringOverlays />,
    doodles: (
      <>
        <Sparkles className="absolute -right-3 top-8 h-6 w-6 text-brand-orange" />
        <svg
          aria-hidden
          className="absolute -left-4 bottom-16 h-10 w-16 text-brand-purple"
          viewBox="0 0 64 24"
          fill="none"
        >
          <path
            d="M2 14C18 4 34 20 50 10C56 6 60 8 62 12"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </>
    ),
  },
  {
    label: "Flexible Scheduling",
    title: "Learn at a Pace That Works for You",
    description:
      "No rigid timetables. Pause when life gets busy, pick sessions that fit your week, and keep learning without the pressure.",
    items: [
      "Book Anytime",
      "Reschedule Easily",
      "Self-Paced Modules",
      "Weekend Slots",
      "Holiday Breaks",
      "Family-Friendly Hours",
    ],
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=720&h=560&fit=crop",
    alt: "Hands on a laptop with coffee — flexible study setup",
    frame: "orange",
    reverse: true,
    overlays: <ScheduleOverlays />,
    doodles: (
      <>
        <div
          aria-hidden
          className="absolute -top-4 right-10 h-8 w-8 rounded-full bg-brand-blue/30 blur-[1px]"
        />
        <svg
          aria-hidden
          className="absolute -bottom-2 right-4 h-8 w-20 text-green-500"
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
      "Quizzes, games, and interactive activities turn study time into something kids actually look forward to — while still hitting the curriculum.",
    items: [
      "Gamified Quizzes",
      "Visual Lessons",
      "Instant Results",
      "Badges & Rewards",
      "Multi-Subject Packs",
      "Kid-Friendly UI",
    ],
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=720&h=560&fit=crop",
    alt: "Child learning on a laptop with colorful interface",
    frame: "purple",
    overlays: <LessonsOverlays />,
    doodles: (
      <>
        <Star className="absolute -left-2 top-12 h-5 w-5 fill-brand-orange/30 text-brand-orange" />
        <svg
          aria-hidden
          className="absolute -right-2 bottom-20 h-12 w-12 text-brand-purple/80"
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
  return (
    <>
      <div className="absolute left-4 top-6 z-10 w-36 rounded-xl bg-card p-sm shadow-float">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-marketing-muted">
          Subject Planned
        </p>
        <ul className="mt-1 space-y-1">
          {["Biology", "Algebra"].map((item) => (
            <li key={item} className="flex items-center gap-1 text-[11px] text-marketing-text">
              <Check className="h-3 w-3 text-brand-purple" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute bottom-8 right-4 z-10 w-44 rounded-xl bg-card p-sm shadow-float">
        <p className="text-[11px] font-bold text-marketing-text">Challenge 1: Anatomy Research</p>
        <div className="mt-2 flex gap-2">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-brand-purple/15" />
          <p className="text-[10px] leading-snug text-marketing-muted">
            Complete the diagram and label key organs.
          </p>
        </div>
      </div>
    </>
  );
}

function ScheduleOverlays() {
  return (
    <div className="absolute bottom-6 left-4 right-4 z-10 rounded-2xl bg-card p-md shadow-float sm:left-8 sm:right-auto sm:w-64">
      <p className="text-sm font-bold text-marketing-text">Schedule</p>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[9px] text-marketing-muted">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={`${d}-${i}`} className={i === 2 ? "font-bold text-brand-purple" : ""}>
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
      <div className="absolute left-4 top-8 z-10 w-40 rounded-xl bg-card p-sm shadow-float">
        <p className="text-xs font-bold text-marketing-text">Sport Quiz</p>
        <div className="mt-2 flex gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm">
            ⚽
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm">
            🏀
          </span>
        </div>
      </div>
      <div className="absolute bottom-10 right-4 z-10 w-44 rounded-xl bg-card p-sm shadow-float">
        <p className="text-[11px] font-bold text-marketing-text">Statistics Math Quiz</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-marketing-grid">
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
}: {
  color: FrameColor;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative p-3 sm:p-4",
        color === "purple" ? "text-brand-purple" : "text-brand-orange",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          "rounded-[2.5rem] rounded-br-[4rem] rounded-tl-[3.5rem]",
          "border-[10px] border-current sm:border-[12px]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function FeatureChecklist({ items }: { items: string[] }) {
  return (
    <ul className="mt-lg grid grid-cols-1 gap-sm sm:grid-cols-2 sm:gap-x-xl sm:gap-y-md">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-sm text-body text-marketing-text">
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
  const media = (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {doodles}
      <BlobFrame color={frame}>
        <div className="relative aspect-[4/3] w-full">
          <Image src={image} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 90vw, 480px" />
          {overlays}
        </div>
      </BlobFrame>
    </div>
  );

  const copy = (
    <div className="flex flex-col justify-center">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-pink">{label}</p>
      <h3 className="mt-sm font-display text-[1.75rem] font-bold leading-tight text-marketing-text sm:text-[2rem]">
        {title}
      </h3>
      <p className="marketing-lead mt-md">{description}</p>
      <FeatureChecklist items={items} />
    </div>
  );

  return (
    <div
      className={cn(
        "grid items-center gap-xl lg:grid-cols-2 lg:gap-xxl",
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
    <section id="offering" className="marketing-grid-bg py-section lg:py-24">
      <div className="container-content">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-badge">What We Offer</span>
          <h2 className="marketing-section-title mt-md text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem]">
            Explore Our <span className="squiggle-underline">Learning</span> Solution
          </h2>
        </div>

        <div className="mt-section flex flex-col gap-section lg:mt-xxl lg:gap-28">
          {FEATURES.map((feature) => (
            <OfferingFeatureRow key={feature.label} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
