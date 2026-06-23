import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function AuthShell({
  title,
  subtitle,
  children,
  className,
}: AuthShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[calc(100vh-3.5rem)] w-full min-w-0 items-center justify-center bg-marketing-bg px-4 py-6 sm:min-h-[calc(100vh-4rem)] sm:px-6 sm:py-8 md:px-8",
        className,
      )}
    >
      <div className="auth-card relative z-10 mx-auto w-full max-w-[28rem] rounded-2xl border border-marketing-grid/80 bg-marketing-bg px-6 py-8 shadow-xl sm:px-8 sm:py-10 md:max-w-[32rem] lg:max-w-[40rem]">
        <h1 className="auth-title text-2xl sm:text-3xl">{title}</h1>
        {subtitle ? (
          <p className="auth-subtitle mt-2 text-base sm:text-lg">{subtitle}</p>
        ) : null}
        <div className="mt-6 w-full">{children}</div>
      </div>
    </div>
  );
}
