"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Crown, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah Thompson",
    role: "mother of Ethan Thompson",
    quote:
      "Since enrolling Ethan at School LMS, we've seen a remarkable improvement in his confidence and academic skills. The staff truly listens to our concerns and works closely with us for his success.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop",
  },
  {
    name: "Mark Williams",
    role: "father of Olivia Williams",
    quote:
      "School LMS has been such a blessing for Olivia. The teachers are supportive, and we're always kept informed about her progress. It feels like we're all working together to help her thrive.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
  },
  {
    name: "Linda Garcia",
    role: "mother of Lucas Garcia",
    quote:
      "The communication and support from School LMS have been exceptional. I can see how much they care about Lucas and his education, and it makes all the difference.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop",
  },
  {
    name: "James Chen",
    role: "father of Mia Chen",
    quote:
      "Flexible scheduling and one-on-one tutoring helped Mia catch up in math without the stress. We finally found a platform that fits our family's rhythm.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
  },
  {
    name: "Emily Roberts",
    role: "mother of Noah Roberts",
    quote:
      "Interactive lessons keep Noah engaged for longer than any workbook ever did. His teachers send clear updates, and we always know what to work on next.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
  },
  {
    name: "David Miller",
    role: "father of Ava Miller",
    quote:
      "From attendance to grades, everything is in one place. School LMS made it easy for us to stay involved in Ava's learning journey every step of the way.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
  },
];

const PAGE_COUNT = 4;
const AUTO_PLAY_MS = 5500;

function StarRating() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-brand-orange text-brand-orange" />
      ))}
    </div>
  );
}

function TestimonialCard({
  name,
  role,
  quote,
  avatar,
  className,
}: Testimonial & { className?: string }) {
  return (
    <article
      className={cn(
        "flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1",
        className,
      )}
    >
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-2 rounded-full bg-gradient-to-br from-brand-purple/30 to-brand-blue/40 blur-sm"
        />
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md">
          <Image src={avatar} alt={name} fill className="object-cover" sizes="80px" />
        </div>
      </div>
      <h3 className="mt-md font-display text-lg font-bold text-marketing-text">{name}</h3>
      <p className="mt-0.5 text-sm capitalize text-marketing-muted">{role}</p>
      <div className="mt-sm">
        <StarRating />
      </div>
      <p className="mt-md text-body leading-relaxed text-marketing-muted">{quote}</p>
    </article>
  );
}

export function MarketingTestimonials() {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isPaused, setIsPaused] = useState(false);

  const visible = [
    TESTIMONIALS[page % TESTIMONIALS.length],
    TESTIMONIALS[(page + 1) % TESTIMONIALS.length],
    TESTIMONIALS[(page + 2) % TESTIMONIALS.length],
  ];

  const goPrev = useCallback(() => {
    setDirection("prev");
    setPage((p) => (p - 1 + PAGE_COUNT) % PAGE_COUNT);
  }, []);

  const goNext = useCallback(() => {
    setDirection("next");
    setPage((p) => (p + 1) % PAGE_COUNT);
  }, []);

  const goToPage = useCallback((index: number) => {
    setDirection(index > page ? "next" : "prev");
    setPage(index);
  }, [page]);

  useEffect(() => {
    if (isPaused) return;

    const id = window.setInterval(() => {
      setDirection("next");
      setPage((p) => (p + 1) % PAGE_COUNT);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(id);
  }, [isPaused]);

  return (
    <section id="testimonials" className="bg-marketing-bg py-section lg:py-24">
      <div className="container-content">
        <div
          className="relative overflow-visible rounded-[2.5rem] bg-marketing-surface px-md py-section sm:px-xl lg:px-16"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          <div className="testimonials-float pointer-events-none absolute left-8 top-24 hidden text-brand-orange lg:block">
            <Sparkles className="h-6 w-6" />
            <Sparkles className="testimonials-float-slow -mt-1 ml-3 h-4 w-4" />
          </div>
          <div className="testimonials-float-slow pointer-events-none absolute right-10 top-20 hidden text-green lg:block">
            <Crown className="h-7 w-7 fill-green/15" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <span className="section-badge">Testimonials</span>
            <h2 className="marketing-section-title mt-md text-[2rem] sm:text-[2.5rem]">
              Listen to Parents&apos; <span className="squiggle-underline">Feedback</span>
            </h2>
            <p className="marketing-lead mx-auto mt-md max-w-2xl">
              Gather and consider parents&apos; feedback to enhance support for students and
              families.
            </p>
          </div>

          <div className="relative mt-section lg:mt-xxl">
            <button
              type="button"
              onClick={goPrev}
              className="absolute -left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-orange text-white shadow-md transition-transform hover:scale-105 active:scale-95 sm:-left-4 lg:-left-6 xl:-left-8"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute -right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-orange text-white shadow-md transition-transform hover:scale-105 active:scale-95 sm:-right-4 lg:-right-6 xl:-right-8"
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </button>

            <div className="overflow-x-hidden">
              <div
                key={page}
                className={cn(
                  "grid gap-xl px-10 md:grid-cols-3 md:gap-lg lg:px-20 xl:px-24",
                  direction === "next" ? "testimonials-track-next" : "testimonials-track-prev",
                )}
              >
                {visible.map((item, index) => (
                  <TestimonialCard
                    key={`${page}-${item.name}`}
                    {...item}
                    className={index > 0 ? "hidden md:flex" : undefined}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-section flex items-center justify-center gap-2">
            {Array.from({ length: PAGE_COUNT }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToPage(i)}
                aria-label={`Go to testimonial slide ${i + 1}`}
                aria-current={page === i ? "true" : undefined}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  page === i ? "w-8 bg-brand-purple" : "w-4 bg-marketing-grid hover:bg-brand-purple/40",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
