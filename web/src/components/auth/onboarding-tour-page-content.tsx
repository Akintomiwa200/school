"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Bell,
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { authService } from "@/services";
import { getRoleDashboardPath } from "@/shared/permissions";
import { UserRole } from "@/shared";
import { AuthShell } from "./auth-shell";
import { cn } from "@/lib/utils";

const TOUR_STEPS = [
  {
    icon: LayoutDashboard,
    title: "Your dashboard",
    body: "See announcements, upcoming classes, and quick actions the moment you sign in.",
    tip: "Use the sidebar to jump between modules anytime.",
  },
  {
    icon: BookOpen,
    title: "Courses & materials",
    body: "Access lessons, assignments, and resources shared by your teachers in one place.",
    tip: "Check the Courses tab for new uploads and due dates.",
  },
  {
    icon: MessageSquare,
    title: "Stay connected",
    body: "Message teachers and receive school updates without leaving the platform.",
    tip: "Look for the messages icon in the top bar after onboarding.",
  },
  {
    icon: Bell,
    title: "Notifications",
    body: "Get alerts for grades, fees, attendance, and important announcements.",
    tip: "You can manage notification preferences from your profile later.",
  },
] as const;

export function OnboardingTourPageContent() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const current = TOUR_STEPS[step];
  const Icon = current.icon;

  const finish = async () => {
    setFinishing(true);
    try {
      await authService.completeOnboarding();
      await update();
      toast.success("You're ready to go!");
      const role = session?.user?.role ?? UserRole.STUDENT;
      router.push(getRoleDashboardPath(role));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setFinishing(false);
    }
  };

  return (
    <AuthShell
      title="Quick product tour"
      subtitle="A few highlights before you open your dashboard."
    >
      <div className="relative overflow-hidden rounded-2xl border border-brand-purple/15 bg-brand-purple/5 p-6">
        <div className="pointer-events-none absolute -right-6 -top-6 text-brand-orange/20">
          <Sparkles className="h-16 w-16" />
        </div>

        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-purple text-white">
          <Icon className="h-6 w-6" />
        </div>

        <h2 className="auth-title relative mt-4 text-xl">{current.title}</h2>
        <p className="auth-body relative mt-2">{current.body}</p>

        <div className="relative mt-4 rounded-xl border border-brand-orange/25 bg-brand-orange/10 px-4 py-3 text-sm text-marketing-text">
          <span className="font-semibold text-brand-orange">Tip: </span>
          {current.tip}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={finish}
          disabled={finishing}
          className="text-sm font-medium text-marketing-muted hover:text-brand-purple"
        >
          Skip tour
        </button>

        {step < TOUR_STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="auth-btn-primary !w-auto px-8"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={finishing}
            className="auth-btn-primary !w-auto px-8"
          >
            {finishing ? "Opening dashboard…" : "Go to dashboard"}
          </button>
        )}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {TOUR_STEPS.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === step ? "w-8 bg-brand-purple" : "w-4 bg-marketing-grid",
            )}
          />
        ))}
      </div>
    </AuthShell>
  );
}
