import { cn } from "@/lib/utils";

export function EventsPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-card text-card-foreground shadow-float",
        className,
      )}
      {...props}
    />
  );
}

export const EVENT_TYPE_STYLES: Record<string, string> = {
  Workshop: "bg-brand-blue/15 text-brand-blue",
  Competition: "bg-brand-purple/15 text-brand-purple",
  Ceremony: "bg-brand-orange/15 text-brand-orange",
  Social: "bg-brand-pink/15 text-brand-pink",
  Academic: "bg-emerald-500/15 text-emerald-600",
  Sports: "bg-green/15 text-green",
};
