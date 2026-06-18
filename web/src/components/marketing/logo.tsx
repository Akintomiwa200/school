import { cn } from "@/lib/utils";
import { appConfig } from "@/config";

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      width="40"
      height="44"
      viewBox="0 0 40 44"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <path
        d="M20 2L36 10V24C36 33 28 40 20 42C12 40 4 33 4 24V10L20 2Z"
        fill="#5d21d0"
      />
      <path d="M20 2L36 10V24C36 28 24 32 20 32V2Z" fill="#ff9f1c" />
      <path
        d="M20 14L21.2 18.2H25.5L22.1 20.8L23.3 25L20 22.5L16.7 25L17.9 20.8L14.5 18.2H18.8L20 14Z"
        fill="white"
      />
    </svg>
  );
}
export function MarketingLogo() {
  return (
    <div className="flex items-center gap-[10px]">
      {/* Purple shield/bookmark icon */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="36" height="36" rx="8" fill="#5d21d0" />
        <path
          d="M18 6C13 6 9 10 9 15C9 20 13 26 18 30C23 26 27 20 27 15C27 10 23 6 18 6Z"
          fill="white"
          opacity="0.25"
        />
        <path
          d="M18 6C18 6 13 10 13 15C13 20 18 30 18 30V6Z"
          fill="white"
          opacity="0.6"
        />
        <path
          d="M18 6C18 6 23 10 23 15C23 20 18 30 18 30V6Z"
          fill="white"
          opacity="0.9"
        />
      </svg>
      {/* Stacked wordmark */}
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold tracking-[0.01em] text-marketing-text">
          Pathway
        </span>
        <span className="text-sm font-bold tracking-[0.01em] text-brand-orange">
          Academy
        </span>
      </div>
    </div>
  );
}
