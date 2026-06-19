"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { AuthDivider } from "./auth-divider";
import { GoogleSignInButton } from "./google-sign-in-button";
import { AuthIllustration, AuthIllustrationMobile } from "./login-illustration";

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
    <div className="marketing-oval-grid-bg relative flex min-h-full w-full items-center justify-center overflow-hidden px-6 py-10 sm:px-8 lg:px-10 lg:py-12 xl:px-12">
      <AuthIllustration className="w-full max-w-2xl xl:max-w-3xl" />
    </div>
  );

  const formPanel = (
    <div className="relative grid min-h-full place-items-center bg-marketing-bg px-8 py-12 lg:px-12 xl:px-16">
      <div className="auth-card relative z-10 rounded-2xl border border-marketing-grid/80 bg-marketing-bg px-8 py-9 shadow-xl sm:px-10 sm:py-10 lg:px-12 lg:py-12">
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
    <form
      id={formId}
      className="marketing-oval-grid-bg relative flex min-h-[calc(100vh-4rem)] w-full flex-col"
      onSubmit={handleSubmit}
    >
      <main className="auth-form-body flex-1 px-6 pb-6 pt-2 sm:px-8">
        <div className="mb-6 w-full">
          <AuthIllustrationMobile />
        </div>

        <h1 className="auth-title text-center text-2xl text-brand-purple">{mobileTitle}</h1>

        <div className="mx-auto mt-6 max-w-md space-y-4">
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
        <div className="relative z-10 mt-auto border-t border-marketing-grid/80 bg-marketing-bg/95 px-6 py-4 backdrop-blur-sm sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-marketing-text">{mobileBottomText}</p>
            {!hideSubmit ? (
              <SubmitButton
                label={submitLabel}
                isSubmitting={isSubmitting}
                className="auth-btn-mobile-bar shrink-0"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </form>
  );
}
