import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function AuthField({
  id,
  label,
  type,
  placeholder,
  className,
  variant = "mobile",
  error,
  disabled,
  ...inputProps
}: {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  className?: string;
  variant?: "desktop" | "mobile";
  error?: string;
  disabled?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "placeholder">) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className={cn(
          "font-medium text-brand-purple",
          variant === "desktop" ? "text-sm" : "text-xs",
        )}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border border-brand-purple/25 bg-marketing-bg px-3 text-marketing-text outline-none transition-shadow placeholder:text-marketing-muted/70 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 disabled:cursor-not-allowed disabled:opacity-60",
          variant === "desktop" ? "h-11 text-sm" : "h-10 text-sm",
          error && "border-destructive focus:border-destructive focus:ring-destructive/20",
        )}
        {...inputProps}
        disabled={disabled}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
