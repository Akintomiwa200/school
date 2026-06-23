"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { StaffAuthIllustration } from "./staff-auth-illustration";

type StaffAuthLayoutProps = {
  renderFields: (variant: "desktop" | "mobile") => ReactNode;
  footer?: ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

function subscribeToDesktopQuery(callback: () => void) {
  const query = window.matchMedia("(min-width: 1280px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getDesktopSnapshot() {
  return window.matchMedia("(min-width: 1280px)").matches;
}

function getDesktopServerSnapshot() {
  return false;
}

function useIsDesktopLayout() {
  return useSyncExternalStore(subscribeToDesktopQuery, getDesktopSnapshot, getDesktopServerSnapshot);
}

function StaffFormHeader({ centered = false }: { centered?: boolean }) {
  return (
    <div className={centered ? "text-center" : "text-center xl:text-left"}>
      <h1 className="auth-title text-2xl sm:text-3xl xl:text-4xl">Staff Sign In</h1>
      <p className="auth-subtitle mt-2 text-base sm:text-lg xl:text-lg">
        Welcome to the Pathway Academy staff portal
      </p>
    </div>
  );
}

export function StaffAuthLayout({
  renderFields,
  footer,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Sign In",
}: StaffAuthLayoutProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const isDesktop = useIsDesktopLayout();

  useEffect(() => {
    if (!isDesktop) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % 3);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [isDesktop]);

  if (isDesktop) {
    return (
      <form
        id="staff-login-form-desktop"
        className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-marketing-bg px-6 py-10 sm:px-8 lg:py-12"
        onSubmit={onSubmit}
      >
        <div className="grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_28rem] items-center gap-10 2xl:gap-16">
          <div className="marketing-oval-grid-bg flex min-w-0 w-full items-center rounded-2xl px-6 py-8 xl:px-10 xl:py-12">
            <StaffAuthIllustration activeSlide={activeSlide} />
          </div>

          <div className="auth-card w-full shrink-0 rounded-2xl border border-marketing-grid/80 bg-marketing-bg px-8 py-9 shadow-xl sm:px-10 sm:py-10">
            <StaffFormHeader />

            <div className="mt-7 w-full space-y-4">
              {renderFields("desktop")}

              <button type="submit" disabled={isSubmitting} className="auth-btn-primary mt-6">
                {isSubmitting ? "Signing in…" : submitLabel}
              </button>

              {footer ? <div className="auth-muted pt-4 text-center xl:text-left">{footer}</div> : null}
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form
      id="staff-login-form"
      className="relative flex min-h-[calc(100vh-4rem)] w-full min-w-0 flex-col bg-marketing-bg"
      onSubmit={onSubmit}
    >
      <main className="auth-form-body flex w-full min-w-0 flex-1 flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <div className="auth-card mx-auto w-full max-w-[28rem] rounded-2xl border border-marketing-grid/80 bg-marketing-bg px-6 py-8 shadow-xl sm:px-8 sm:py-10 md:max-w-[32rem] lg:max-w-[40rem]">
          <StaffFormHeader centered />

          <div className="mt-6 w-full space-y-4 sm:mt-7">
            {renderFields("mobile")}

            <button type="submit" disabled={isSubmitting} className="auth-btn-primary mt-2 sm:mt-4">
              {isSubmitting ? "Signing in…" : submitLabel}
            </button>

            {footer ? <div className="auth-muted pt-3 text-center sm:pt-4">{footer}</div> : null}
          </div>
        </div>
      </main>
    </form>
  );
}
