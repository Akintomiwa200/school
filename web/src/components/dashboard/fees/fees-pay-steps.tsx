import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Select fees" },
  { id: 2, label: "Payment gateway" },
  { id: 3, label: "Confirmation" },
  { id: 4, label: "Receipt" },
] as const;

export function FeesPaySteps({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 sm:gap-0">
      {STEPS.map((step, index) => {
        const isComplete = step.id < currentStep;
        const isCurrent = step.id === currentStep;

        return (
          <li key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  isComplete
                    ? "bg-green text-white"
                    : isCurrent
                      ? "bg-brand-purple text-white"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isComplete ? "✓" : step.id}
              </span>
              <span
                className={cn(
                  "text-xs font-medium sm:text-sm",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <span className="mx-2 hidden h-px w-8 bg-border sm:mx-3 sm:inline-block sm:w-12" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
