"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { AuthDivider } from "./auth-divider";
import { GoogleSignInButton } from "./google-sign-in-button";
import { AuthIllustration } from "./login-illustration";

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
  return false;
}

function useIsDesktopLayout() {
  return useSyncExternalStore(subscribeToDesktopQuery, getDesktopSnapshot, getDesktopServerSnapshot);
}

function AuthMobileCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-card mx-auto w-full max-w-[28rem] rounded-2xl border border-marketing-grid/80 bg-marketing-bg px-6 py-8 shadow-xl sm:px-8 sm:py-10 md:max-w-[32rem] lg:max-w-[40rem]">
      <h1 className="auth-title text-center text-2xl sm:text-3xl">{title}</h1>
      {subtitle ? (
        <p className="auth-subtitle mt-2 text-center text-base sm:text-lg">{subtitle}</p>
      ) : null}
      <div className="mt-6 w-full space-y-4 sm:mt-7">{children}</div>
    </div>
  );
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
  hideSubmit = false,
  isSubmitting = false,
  onSubmit,
}: AuthPageLayoutProps) {
  const isDesktop = useIsDesktopLayout();
  const handleSubmit = onSubmit ?? ((e: React.FormEvent<HTMLFormElement>) => e.preventDefault());

  const illustrationPanel = (
    <div className="marketing-oval-grid-bg relative flex min-h-full w-full items-center justify-center px-6 py-10 sm:px-8 lg:px-10 lg:py-12 xl:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <AuthIllustration className="w-full max-w-2xl xl:max-w-3xl" />
      </div>
    </div>
  );

  const formPanel = (
    <div className="relative grid min-h-full w-full place-items-center bg-marketing-bg px-8 py-12 lg:px-12 xl:px-16">
      <div className="auth-card relative z-10 w-full max-w-[28rem] rounded-2xl border border-marketing-grid/80 bg-marketing-bg px-8 py-9 shadow-xl sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <h1 className="auth-title text-3xl lg:text-4xl">{desktopTitle}</h1>
        <p className="auth-subtitle mt-2 text-base lg:text-lg">{desktopSubtitle}</p>

        <div className="mt-7 w-full">
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
      className="relative flex min-h-[calc(100vh-4rem)] w-full min-w-0 flex-col bg-marketing-bg"
      onSubmit={handleSubmit}
    >
      <main className="auth-form-body flex w-full min-w-0 flex-1 flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <AuthMobileCard title={mobileTitle} subtitle={desktopSubtitle}>
          {renderFields("mobile")}

          {mobileForgotPassword ? (
            <p className="text-right text-sm">
              <Link href="/forgot-password" className="auth-link">
                Forgot Password?
              </Link>
            </p>
          ) : null}

          {!hideSubmit ? (
            <SubmitButton
              label={submitLabel}
              isSubmitting={isSubmitting}
              className="auth-btn-primary mt-2 sm:mt-4"
            />
          ) : null}

          {showSocial ? (
            <div className="pt-2">
              <AuthDivider />
              <GoogleSignInButton callbackUrl={googleCallbackUrl} disabled={isSubmitting} />
            </div>
          ) : null}

          {mobileBottomText ? (
            <p className="auth-muted pt-3 text-center sm:pt-4">{mobileBottomText}</p>
          ) : desktopFooter ? (
            <div className="pt-3 text-center sm:pt-4">{desktopFooter}</div>
          ) : null}
        </AuthMobileCard>
      </main>
    </form>
  );
}
