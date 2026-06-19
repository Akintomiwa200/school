import type { ReactNode } from "react";
import Image from "next/image";
import { BookOpen, Lightbulb, Pencil } from "lucide-react";
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
        "flex h-11 w-11 items-center justify-center rounded-2xl bg-marketing-bg shadow-float",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function HeroStudentLeft({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto h-[300px] w-[240px] shrink-0", className)}>
      <div className="absolute bottom-5 left-3 h-36 w-28 rounded-2xl bg-brand-orange" />
      <div className="absolute bottom-8 left-8 h-44 w-44 rounded-full bg-brand-blue/90" />
      <div className="absolute bottom-2 left-11 h-52 w-40 overflow-hidden rounded-[1.75rem]">
        <Image
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=520&fit=crop"
          alt="Student with laptop"
          fill
          className="object-cover object-top"
          sizes="160px"
          priority
        />
      </div>
      <FloatingIcon className="absolute left-0 top-12 text-brand-purple">
        <BookOpen className="h-5 w-5" />
      </FloatingIcon>
      <FloatingIcon className="absolute bottom-24 right-0 text-red-500">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <path d="M12 20.94c1.5 0 2.75-.88 3.5-.88 1.63 0 2.5 1.5 4.5 1.5s3.17-2.08 3.17-4.5c0-3.06-1.67-5.06-3.67-5.06-.75 0-1.5.5-2.5.5S15.5 12 12 12s-3.5.5-4.5.5-1.75-.5-2.5-.5C3 12 1.33 14 1.33 17.06 1.33 19.42 2.5 21.56 4.5 21.56c2 0 2.87-1.5 4.5-1.5.75 0 2 .88 3.5.88z" />
          <path d="M12 7c0-2.21 1.79-4 4-4" />
        </svg>
      </FloatingIcon>
    </div>
  );
}

export function HeroStudentRight({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto h-[300px] w-[240px] shrink-0", className)}>
      <svg
        viewBox="0 0 240 300"
        className="absolute inset-0 h-full w-full text-brand-purple"
        aria-hidden
      >
        <path
          d="M50 60 C90 10 180 10 210 55 C235 90 235 160 210 200 C185 242 140 280 120 292 C100 280 55 242 30 200 C5 160 5 90 50 60Z"
          fill="currentColor"
        />
      </svg>
      <div className="absolute bottom-2 left-7 h-52 w-40 overflow-hidden rounded-[1.75rem]">
        <Image
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=520&fit=crop"
          alt="Student with books"
          fill
          className="object-cover object-top"
          sizes="160px"
          priority
        />
      </div>
      <FloatingIcon className="absolute right-1 top-12 text-brand-orange">
        <Lightbulb className="h-5 w-5 fill-brand-orange/20" />
      </FloatingIcon>
      <FloatingIcon className="absolute bottom-24 left-1 text-yellow-500">
        <Pencil className="h-5 w-5" />
      </FloatingIcon>
    </div>
  );
}

export function HeroStudentMobile({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center">
      <div className="relative h-[174px] w-[139px] min-[390px]:h-[204px] min-[390px]:w-[163px] min-[480px]:h-[240px] min-[480px]:w-[192px] sm:h-[264px] sm:w-[211px]">
        <div className="absolute bottom-0 left-1/2 origin-bottom -translate-x-1/2 scale-[0.58] min-[390px]:scale-[0.68] min-[480px]:scale-[0.8] sm:scale-[0.88]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthIllustration() {
  return (
    <div className="flex items-end justify-center gap-2 xl:gap-4">
      <HeroStudentLeft className="scale-95 xl:scale-100" />
      <HeroStudentRight className="scale-95 xl:scale-100" />
    </div>
  );
}

export function AuthIllustrationMobile() {
  return (
    <div className="flex items-end justify-center gap-0 overflow-visible px-1 sm:gap-2">
      <HeroStudentMobile>
        <HeroStudentLeft />
      </HeroStudentMobile>
      <HeroStudentMobile>
        <HeroStudentRight />
      </HeroStudentMobile>
    </div>
  );
}
