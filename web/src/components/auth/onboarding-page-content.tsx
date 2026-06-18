"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authService } from "@/services";
import { onboardingSchema, type OnboardingInput } from "@/shared";
import { AuthShell } from "./auth-shell";
import { cn } from "@/lib/utils";

const REFERRAL_OPTIONS = [
  "Google search",
  "Social media",
  "Friend or family",
  "School referral",
  "Advertisement",
  "Other",
] as const;

const GOAL_OPTIONS = [
  "Track my child's progress",
  "Access courses and materials",
  "Communicate with teachers",
  "Manage fees and payments",
  "Explore the platform",
] as const;

const GRADE_OPTIONS = ["Primary", "Secondary", "College", "Other"] as const;

function SelectCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
        selected
          ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
          : "border-marketing-grid bg-marketing-bg text-marketing-text hover:border-brand-purple/40",
      )}
    >
      {label}
    </button>
  );
}

export function OnboardingPageContent() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      referralSource: "",
      primaryGoal: "",
      role: "STUDENT",
      gradeLevel: "",
      newsletter: true,
    },
  });

  const referralSource = watch("referralSource");
  const primaryGoal = watch("primaryGoal");
  const role = watch("role");
  const gradeLevel = watch("gradeLevel");

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authService.saveOnboarding(values);
      toast.success("Thanks! One quick tour next.");
      router.push("/onboarding/tour");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  });

  const steps = [
    {
      title: "Where did you hear about us?",
      subtitle: "This helps us understand how families find Pathway Academy.",
      content: (
        <div className="grid gap-2">
          {REFERRAL_OPTIONS.map((option) => (
            <SelectCard
              key={option}
              label={option}
              selected={referralSource === option}
              onClick={() => setValue("referralSource", option, { shouldValidate: true })}
            />
          ))}
        </div>
      ),
      canNext: Boolean(referralSource),
    },
    {
      title: "What brings you here?",
      subtitle: "Pick the goal that best matches what you want to do.",
      content: (
        <div className="grid gap-2">
          {GOAL_OPTIONS.map((option) => (
            <SelectCard
              key={option}
              label={option}
              selected={primaryGoal === option}
              onClick={() => setValue("primaryGoal", option, { shouldValidate: true })}
            />
          ))}
        </div>
      ),
      canNext: Boolean(primaryGoal),
    },
    {
      title: "Tell us a bit more",
      subtitle: "So we can tailor your dashboard experience.",
      content: (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-brand-purple">I am a</p>
            <div className="grid grid-cols-2 gap-2">
              {(["STUDENT", "PARENT"] as const).map((option) => (
                <SelectCard
                  key={option}
                  label={option === "STUDENT" ? "Student" : "Parent"}
                  selected={role === option}
                  onClick={() => setValue("role", option)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-brand-purple">Grade level</p>
            <div className="grid grid-cols-2 gap-2">
              {GRADE_OPTIONS.map((option) => (
                <SelectCard
                  key={option}
                  label={option}
                  selected={gradeLevel === option}
                  onClick={() => setValue("gradeLevel", option)}
                />
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-marketing-muted">
            <input
              type="checkbox"
              checked={watch("newsletter")}
              onChange={(e) => setValue("newsletter", e.target.checked)}
              className="h-4 w-4 rounded border-brand-purple/30 text-brand-purple focus:ring-brand-purple/20"
            />
            Send me tips and product updates
          </label>
        </div>
      ),
      canNext: true,
    },
  ] as const;

  const current = steps[step];

  return (
    <AuthShell title={current.title} subtitle={current.subtitle}>
      <form onSubmit={onSubmit} className="space-y-6">
        {current.content}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="text-sm font-medium text-brand-purple disabled:opacity-40"
          >
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              disabled={!current.canNext}
              onClick={() => setStep((s) => s + 1)}
              className="auth-btn-primary !w-auto px-8"
            >
              Next
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="auth-btn-primary !w-auto px-8">
              {isSubmitting ? "Saving…" : "Continue"}
            </button>
          )}
        </div>

        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-8 bg-brand-purple" : "w-4 bg-marketing-grid",
              )}
            />
          ))}
        </div>
      </form>
    </AuthShell>
  );
}
