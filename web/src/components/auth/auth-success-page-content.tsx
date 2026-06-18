"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2 } from "lucide-react";
import { authService } from "@/services";
import { getRoleDashboardPath } from "@/shared/permissions";
import { UserRole } from "@/shared";
import { AuthShell } from "./auth-shell";

function AuthSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const flow = searchParams.get("flow") ?? "login";
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    authService
      .getOnboarding()
      .then((res) => {
        const completed = res.data?.onboardingCompleted;
        if (completed) {
          const role = session?.user?.role ?? UserRole.STUDENT;
          router.replace(getRoleDashboardPath(role));
          return;
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [status, session, router]);

  const title =
    flow === "signup" ? "Account created!" : flow === "google" ? "Signed in with Google" : "Welcome back!";
  const subtitle =
    flow === "signup"
      ? "Your email is verified. Let’s personalize your experience."
      : "You’re verified. Let’s finish setting up your account.";

  if (status === "loading" || checking) {
    return (
      <AuthShell title="Success" subtitle="Preparing your account…">
        <p className="auth-body text-center">Please wait…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={title} subtitle={subtitle}>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <p className="auth-body mt-4">
          {session?.user?.name ? `Hi ${session.user.name.split(" ")[0]}, ` : ""}
          you&apos;re all set to continue onboarding.
        </p>
        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="auth-btn-primary mt-6"
        >
          Continue
        </button>
      </div>
    </AuthShell>
  );
}

export function AuthSuccessPageContent() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Success" subtitle="Loading…">
          <p className="auth-body text-center">Please wait…</p>
        </AuthShell>
      }
    >
      <AuthSuccessInner />
    </Suspense>
  );
}
