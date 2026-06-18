"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
};

export function OtpInput({ value, onChange, disabled, error }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const updateAt = (index: number, char: string) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").slice(0, 6));
  };

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${index + 1}`}
            className={cn(
              "h-12 w-10 rounded-lg border bg-marketing-bg text-center text-lg font-semibold text-marketing-text outline-none transition-shadow sm:h-14 sm:w-12",
              error
                ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                : "border-brand-purple/25 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20",
            )}
            onChange={(e) => {
              const char = e.target.value.replace(/\D/g, "").slice(-1);
              updateAt(index, char);
              if (char && index < 5) inputsRef.current[index + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[index] && index > 0) {
                inputsRef.current[index - 1]?.focus();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
              if (!pasted) return;
              onChange(pasted);
              inputsRef.current[Math.min(pasted.length, 5)]?.focus();
            }}
          />
        ))}
      </div>
      {error ? <p className="mt-2 text-center text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
