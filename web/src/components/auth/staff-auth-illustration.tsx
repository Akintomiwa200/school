import { cn } from "@/lib/utils";

const SLIDES = [
  {
    title: "Distance Learning Programs",
    description:
      "Attend live and recorded classes at your own convenience. Host virtual lessons, share lesson recordings with your class, and let students catch up anytime from any device.",
    Illustration: DistanceLearningIllustration,
  },
  {
    title: "Staff Operations Hub",
    description:
      "Manage classes, attendance, fees, and school records in one place. Update timetables, mark daily attendance, and generate reports without jumping between separate systems.",
    Illustration: StaffOperationsIllustration,
  },
  {
    title: "Role-Based Access",
    description:
      "Every team member sees only the tools they need for their role. Teachers, accountants, librarians, and admins each get a focused workspace with permissions matched to their duties.",
    Illustration: RoleAccessIllustration,
  },
] as const;

function DistanceLearningIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 280"
      className={cn("h-auto w-full max-w-[min(100%,380px)] text-brand-purple", className)}
      aria-hidden
    >
      <rect x="72" y="48" width="216" height="136" rx="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="88" y="64" width="184" height="96" rx="8" fill="currentColor" opacity="0.08" />
      <circle cx="180" cy="108" r="22" fill="#ff9f1c" opacity="0.9" />
      <path d="M174 100v16l12 7" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M108 176h144" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="132" y="184" width="96" height="10" rx="5" fill="currentColor" opacity="0.15" />
      <circle cx="108" cy="210" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="252" cy="210" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M96 228c8-10 20-16 36-16h96c16 0 28 6 36 16" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M286 72l18 10v36l-18 10V72z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M304 88l14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StaffOperationsIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 280"
      className={cn("h-auto w-full max-w-[min(100%,380px)] text-brand-purple", className)}
      aria-hidden
    >
      <rect x="64" y="52" width="232" height="168" rx="16" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="84" y="72" width="88" height="56" rx="8" fill="currentColor" opacity="0.1" />
      <path d="M96 92h64M96 104h48M96 116h56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="188" y="72" width="88" height="56" rx="8" fill="currentColor" opacity="0.1" />
      <path d="M200 108c10-12 24-12 34 0M214 96v24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="84" y="144" width="192" height="56" rx="8" fill="currentColor" opacity="0.08" />
      <path d="M96 168h40M152 168h40M208 168h40" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.35" />
      <path d="M96 184h28M152 184h52M220 184h32" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.2" />
      <rect x="118" y="228" width="124" height="18" rx="9" fill="#ff9f1c" opacity="0.85" />
      <path d="M148 237h64" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RoleAccessIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 280"
      className={cn("h-auto w-full max-w-[min(100%,380px)] text-brand-purple", className)}
      aria-hidden
    >
      <path
        d="M180 58l88 34v58c0 42-38 72-88 88-50-16-88-46-88-88V92l88-34z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="180" cy="118" r="28" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M140 176c8-18 24-28 40-28s32 10 40 28" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="98" y="206" width="56" height="28" rx="14" fill="currentColor" opacity="0.12" />
      <rect x="206" y="206" width="56" height="28" rx="14" fill="currentColor" opacity="0.12" />
      <path d="M110 220h32M218 220h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="126" cy="214" r="5" fill="#ff9f1c" />
      <circle cx="234" cy="214" r="5" fill="#ff9f1c" />
      <path d="M168 92h24M180 80v24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
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
  const Illustration = slide.Illustration;

  return (
    <div
      className={cn(
        "flex min-w-0 w-full flex-col items-start justify-center py-4 text-left xl:py-6",
        className,
      )}
    >
      <Illustration className="mb-8 w-full max-w-[380px] xl:mb-10" />

      <h2 className="auth-title min-w-0 w-full text-2xl font-bold xl:text-3xl">{slide.title}</h2>
      <p className="auth-subtitle mt-4 min-w-0 w-full text-base leading-relaxed xl:text-lg xl:leading-8">
        {slide.description}
      </p>

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
