import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function AuthShell({ title, subtitle, children, className }: AuthShellProps) {
  return (
    <div className={cn("flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-10 sm:min-h-[calc(100vh-4rem)]", className)}>
      <div className="w-full max-w-md rounded-2xl border border-marketing-grid/80 bg-marketing-bg p-8 shadow-xl sm:p-10">
        <h1 className="auth-title text-2xl sm:text-3xl">{title}</h1>
        {subtitle ? <p className="auth-subtitle mt-2 text-sm sm:text-base">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
