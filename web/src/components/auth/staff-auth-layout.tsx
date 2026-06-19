"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { StaffAuthIllustration, StaffAuthIllustrationMobile } from "./staff-auth-illustration";

type StaffAuthLayoutProps = {
  renderFields: (variant: "desktop" | "mobile") => ReactNode;
  footer?: ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

function subscribeToDesktopQuery(callback: () => void) {
  const query = window.matchMedia("(min-width: 1024px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getDesktopSnapshot() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

function getDesktopServerSnapshot() {
  return true;
}

function useIsDesktopLayout() {
  return useSyncExternalStore(subscribeToDesktopQuery, getDesktopSnapshot, getDesktopServerSnapshot);
}

function StaffFormHeader() {
  return (
    <div className="text-center">
      <h1 className="auth-title text-3xl lg:text-4xl">Staff Sign In</h1>
      <p className="auth-subtitle mt-2 text-sm lg:text-base">
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
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % 3);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const illustrationPanel = (
    <div className="marketing-oval-grid-bg relative flex min-h-full w-full items-center justify-center overflow-hidden px-6 py-10 sm:px-8 lg:px-10 lg:py-12 xl:px-12">
      <StaffAuthIllustration activeSlide={activeSlide} className="w-full max-w-2xl xl:max-w-3xl" />
    </div>
  );

  const formPanel = (
    <div className="relative grid min-h-full w-full place-items-center bg-marketing-bg px-8 py-12 lg:px-12 xl:px-16">
      <div className="auth-card relative z-10 rounded-2xl border border-marketing-grid/80 bg-marketing-bg px-8 py-9 shadow-xl sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <StaffFormHeader />

        <div className="mt-7 w-full space-y-4">
          {renderFields("desktop")}

          <button type="submit" disabled={isSubmitting} className="auth-btn-primary mt-6">
            {isSubmitting ? "Signing in…" : submitLabel}
          </button>

          {footer ? <div className="auth-muted pt-4 text-center">{footer}</div> : null}
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <form
        id="staff-login-form-desktop"
        className="grid min-h-[calc(100vh-4rem)] w-full lg:grid-cols-2"
        onSubmit={onSubmit}
      >
        {illustrationPanel}
        {formPanel}
      </form>
    );
  }

  return (
    <form
      id="staff-login-form"
      className="marketing-oval-grid-bg relative flex min-h-[calc(100vh-4rem)] w-full flex-col"
      onSubmit={onSubmit}
    >
      <main className="auth-form-body flex-1 px-6 pb-6 pt-2 sm:px-8">
        <div className="mb-6 w-full">
          <StaffAuthIllustrationMobile />
        </div>

        <h1 className="auth-title text-center text-2xl text-brand-purple">Staff Sign In</h1>
        <p className="auth-subtitle mt-2 text-center text-sm">
          Welcome to the Pathway Academy staff portal
        </p>

        <div className="mx-auto mt-6 w-full space-y-4">
          {renderFields("mobile")}

          <button type="submit" disabled={isSubmitting} className="auth-btn-primary">
            {isSubmitting ? "Signing in…" : submitLabel}
          </button>

          {footer ? <div className="auth-muted pt-2 text-center">{footer}</div> : null}
        </div>
      </main>
    </form>
  );
}
