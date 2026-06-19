import { cn } from "@/lib/utils";

export function MarketingLogo({ variant = "default" }: { variant?: "default" | "auth" }) {
  const isAuth = variant === "auth";

  return (
    <div className="flex items-center gap-3">
      <svg
        width={isAuth ? 48 : 36}
        height={isAuth ? 48 : 36}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
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
      <div className={cn("flex flex-col leading-tight", isAuth && "gap-0.5")}>
        <span
          className={cn(
            "font-bold tracking-[0.01em] text-marketing-text",
            isAuth ? "text-xl lg:text-2xl" : "text-sm",
          )}
        >
          Pathway
        </span>
        <span
          className={cn(
            "font-bold tracking-[0.01em] text-brand-orange",
            isAuth ? "text-xl lg:text-2xl" : "text-sm",
          )}
        >
          Academy
        </span>
      </div>
    </div>
  );
}
