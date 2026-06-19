import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AuthIllustrationMobile } from "./login-illustration";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  showIllustration?: boolean;
};

export function AuthShell({
  title,
  subtitle,
  children,
  className,
  showIllustration = false,
}: AuthShellProps) {
  return (
    <div
      className={cn(
        "marketing-oval-grid-bg relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-10 sm:min-h-[calc(100vh-4rem)]",
        className,
      )}
    >
      <div className="relative z-10 w-full max-w-md">
        {showIllustration ? (
          <div className="mb-4 lg:hidden">
            <AuthIllustrationMobile />
          </div>
        ) : null}

        <div className="rounded-2xl border border-marketing-grid/80 bg-marketing-bg p-8 shadow-xl sm:p-10">
          <h1 className="auth-title text-2xl sm:text-3xl">{title}</h1>
          {subtitle ? <p className="auth-subtitle mt-2 text-sm sm:text-base">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
