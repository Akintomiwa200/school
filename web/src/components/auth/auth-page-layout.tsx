"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { AuthWaveBottom, AuthWaveTop } from "./auth-waves";
import { AuthDivider } from "./auth-divider";
import { GoogleSignInButton } from "./google-sign-in-button";
import { LoginIllustration } from "./login-illustration";

type AuthPageLayoutProps = {
  formId: string;
  desktopTitle: string;
  desktopSubtitle: string;
  mobileTitle: string;
  submitLabel: string;
  renderFields: (variant: "desktop" | "mobile") => ReactNode;
  desktopFooter?: ReactNode;
  mobileForgotPassword?: boolean;
  mobileBottomText?: ReactNode;
  formSide?: "left" | "right";
  showSocial?: boolean;
  googleCallbackUrl?: string;
  mobileSubmit?: "footer-bar" | "inline";
  hideSubmit?: boolean;
  isSubmitting?: boolean;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
};

function SubmitButton({
  label,
  isSubmitting,
  className,
}: {
  label: string;
  isSubmitting?: boolean;
  className?: string;
}) {
  return (
    <button type="submit" disabled={isSubmitting} className={className}>
      {isSubmitting ? "Please wait…" : label}
    </button>
  );
}

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

export function AuthPageLayout({
  formId,
  desktopTitle,
  desktopSubtitle,
  mobileTitle,
  submitLabel,
  renderFields,
  desktopFooter,
  mobileForgotPassword = false,
  mobileBottomText,
  formSide = "right",
  showSocial = true,
  googleCallbackUrl = "/auth/success?flow=google",
  mobileSubmit = "footer-bar",
  hideSubmit = false,
  isSubmitting = false,
  onSubmit,
}: AuthPageLayoutProps) {
  const isDesktop = useIsDesktopLayout();
  const handleSubmit = onSubmit ?? ((e: React.FormEvent<HTMLFormElement>) => e.preventDefault());

  const illustrationPanel = (
    <div className="marketing-grid-bg flex min-h-full items-center justify-center px-12 py-16 lg:px-16 xl:px-20">
      <LoginIllustration />
    </div>
  );

  const formPanel = (
    <div className="relative grid min-h-full place-items-center overflow-hidden bg-marketing-surface px-12 py-16 lg:px-16 xl:px-20">
      <div
        aria-hidden
        className={
          formSide === "left"
            ? "pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full border border-brand-purple/15 bg-brand-purple/5"
            : "pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full border border-brand-purple/15 bg-brand-purple/5"
        }
      />
      <div
        aria-hidden
        className={
          formSide === "left"
            ? "pointer-events-none absolute bottom-10 left-10 h-40 w-40 rounded-full border border-brand-orange/20 bg-brand-orange/10"
            : "pointer-events-none absolute bottom-10 right-10 h-40 w-40 rounded-full border border-brand-orange/20 bg-brand-orange/10"
        }
      />

      <div className="auth-card relative z-10 rounded-2xl border border-marketing-grid/80 bg-marketing-bg px-10 py-10 shadow-xl lg:px-12 lg:py-12">
        <h1 className="auth-title text-3xl lg:text-4xl">{desktopTitle}</h1>
        <p className="auth-subtitle mt-2 text-sm lg:text-base">{desktopSubtitle}</p>

        <div className="mt-7">
          {renderFields("desktop")}

          {!hideSubmit ? (
            <SubmitButton
              label={submitLabel}
              isSubmitting={isSubmitting}
              className="auth-btn-primary mt-6"
            />
          ) : null}

          {showSocial ? (
            <>
              <AuthDivider />
              <GoogleSignInButton callbackUrl={googleCallbackUrl} disabled={isSubmitting} />
            </>
          ) : null}

          {desktopFooter ? <div className="pt-4">{desktopFooter}</div> : null}
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <form
        id={`${formId}-desktop`}
        className="grid min-h-[calc(100vh-4rem)] w-full lg:grid-cols-2"
        onSubmit={handleSubmit}
      >
        {formSide === "left" ? (
          <>
            {formPanel}
            {illustrationPanel}
          </>
        ) : (
          <>
            {illustrationPanel}
            {formPanel}
          </>
        )}
      </form>
    );
  }

  return (
    <form id={formId} className="flex min-h-[calc(100vh-4rem)] w-full flex-col bg-marketing-bg" onSubmit={handleSubmit}>
      <AuthWaveTop className="h-32 w-full" />

      <main className="auth-form-body px-6 pb-8 pt-4 sm:px-8">
        <h1 className="auth-title text-2xl text-brand-purple">{mobileTitle}</h1>

        <div className="mt-6 space-y-4">
          {renderFields("mobile")}

          {mobileForgotPassword ? (
            <p className="text-right text-xs">
              <Link href="/forgot-password" className="auth-link">
                Forgot Password?
              </Link>
            </p>
          ) : null}

          {mobileSubmit === "inline" && !hideSubmit ? (
            <SubmitButton label={submitLabel} isSubmitting={isSubmitting} className="auth-btn-primary" />
          ) : null}

          {showSocial ? (
            <div className="pt-2">
              <AuthDivider />
              <GoogleSignInButton callbackUrl={googleCallbackUrl} disabled={isSubmitting} />
            </div>
          ) : null}

          {desktopFooter ? <div className="pt-2">{desktopFooter}</div> : null}
        </div>
      </main>

      {mobileSubmit === "footer-bar" && mobileBottomText ? (
        <div className="relative mt-auto w-full">
          <AuthWaveBottom className="h-28 w-full" />
          <div className="absolute inset-0 flex items-center justify-between px-6 pb-2 pt-8">
            <p className="text-sm text-white">{mobileBottomText}</p>
            {!hideSubmit ? (
              <SubmitButton label={submitLabel} isSubmitting={isSubmitting} className="auth-btn-mobile-bar" />
            ) : null}
          </div>
        </div>
      ) : null}
    </form>
  );
}
