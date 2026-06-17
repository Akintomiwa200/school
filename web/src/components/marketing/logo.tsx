import { cn } from "@/lib/utils";
import { appConfig } from "@/config";

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      width="40"
      height="44"
      viewBox="0 0 40 44"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <path d="M20 2L36 10V24C36 33 28 40 20 42C12 40 4 33 4 24V10L20 2Z" fill="#5d21d0" />
      <path d="M20 2L36 10V24C36 28 24 32 20 32V2Z" fill="#ff9f1c" />
      <path
        d="M20 14L21.2 18.2H25.5L22.1 20.8L23.3 25L20 22.5L16.7 25L17.9 20.8L14.5 18.2H18.8L20 14Z"
        fill="white"
      />
    </svg>
  );
}

export function MarketingLogo({
  className,
  stacked = false,
}: {
  className?: string;
  stacked?: boolean;
}) {
  const [nameA, nameB] = splitBrandName(appConfig.name);

  return (
    <div className={cn("flex items-center gap-sm", className)}>
      <ShieldIcon />
      {stacked ? (
        <span className="font-display text-xl font-bold leading-tight tracking-tight">
          <span className="block text-brand-purple">{nameA}</span>
          {nameB ? <span className="block text-brand-orange">{nameB}</span> : null}
        </span>
      ) : (
        <span className="font-display text-xl font-bold leading-none tracking-tight">
          <span className="text-brand-purple">{nameA}</span>{" "}
          {nameB ? <span className="text-brand-orange">{nameB}</span> : null}
        </span>
      )}
    </div>
  );
}
function splitBrandName(name: string): [string, string] {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return [name, ""];
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
}
