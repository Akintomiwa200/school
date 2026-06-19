import { cn } from "@/lib/utils";

const SLIDES = [
  {
    title: "Distance Learning Programs",
    subtitle: "Attend live and recorded classes at your own convenience.",
  },
  {
    title: "Staff Operations Hub",
    subtitle: "Manage classes, attendance, fees, and school records in one place.",
  },
  {
    title: "Role-Based Access",
    subtitle: "Every team member sees only the tools they need for their role.",
  },
];

function StaffIllustrationSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 280"
      className={cn("h-auto w-full max-w-[min(100%,380px)] text-brand-purple", className)}
      aria-hidden
    >
      <circle cx="180" cy="140" r="118" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      <path
        d="M92 210h176M110 210v-28c0-8 6-14 14-14h112c8 0 14 6 14 14v28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="126" y="168" width="108" height="14" rx="4" fill="currentColor" opacity="0.12" />
      <path
        d="M118 92c8-18 28-28 48-24 14 3 24 14 28 28M214 88c10-16 30-24 38-22 18 2 32 16 34 34"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="132" cy="108" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="228" cy="104" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M108 138c6 24 18 36 36 36h72c18 0 30-12 36-36" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="148" y="118" width="64" height="42" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M156 132h48M156 144h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M96 176h28l8-34 12 34h20l-10-48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M264 176h-28l-8-34-12 34h-20l10-48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="248" cy="72" r="8" fill="#ff9f1c" opacity="0.9" />
    </svg>
  );
}

export function StaffAuthIllustrationMobile({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full justify-center px-2", className)}>
      <StaffIllustrationSvg />
    </div>
  );
}

export function StaffAuthIllustration({
  activeSlide = 0,
  className,
}: {
  activeSlide?: number;
  className?: string;
}) {
  const slide = SLIDES[activeSlide] ?? SLIDES[0];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-8 text-center lg:px-8 lg:py-12",
        className,
      )}
    >
      <StaffIllustrationSvg className="mb-8 lg:mb-10" />

      <h2 className="auth-title w-full text-2xl font-bold lg:text-3xl">{slide.title}</h2>
      <p className="auth-subtitle mt-3 w-full text-sm leading-relaxed lg:text-base">{slide.subtitle}</p>

      <div className="mt-8 flex items-center gap-2 lg:mt-10" aria-hidden>
        {SLIDES.map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              index === activeSlide ? "bg-brand-purple" : "bg-brand-purple/25",
            )}
          />
        ))}
      </div>
    </div>
  );
}
