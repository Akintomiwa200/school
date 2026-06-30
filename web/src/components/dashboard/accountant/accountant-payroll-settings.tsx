"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePayrollSettings, useUpdatePayrollSettings } from "@/hooks/use-dashboard-data";
import { AuditSectionCard } from "./accountant-audit-ui";

export function AccountantPayrollSettings() {
  const { data: settings = {
    taxRate: 0.12,
    pensionRate: 0.06,
    healthRate: 0.03,
    housingAllowanceRate: 0.12,
    performanceBonusRate: 0.06,
    payFrequency: "monthly" as const,
    defaultPayDay: 28,
    autoPostExpenseOnFinalize: true,
    currency: "USD",
  } } = usePayrollSettings();
  const updateSettings = useUpdatePayrollSettings();

  function save(patch: Record<string, number | boolean>) {
    void updateSettings.mutateAsync(patch);
  }

  return (
    <AuditSectionCard title="Payroll settings">
      <p className="mb-4 text-sm text-muted-foreground">
        Tax and allowance rates apply to all new calculations. Changes take effect on the next add or edit.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            { key: "taxRate", label: "Income tax rate", step: 0.01, max: 0.5 },
            { key: "pensionRate", label: "Pension rate", step: 0.01, max: 0.3 },
            { key: "healthRate", label: "Health insurance rate", step: 0.01, max: 0.2 },
            { key: "housingAllowanceRate", label: "Housing allowance", step: 0.01, max: 0.3 },
            { key: "performanceBonusRate", label: "Performance bonus", step: 0.01, max: 0.3 },
          ] as const
        ).map((field) => (
          <label key={field.key} className="block text-sm">
            <span className="mb-1.5 block font-medium">{field.label}</span>
            <input
              type="number"
              min={0}
              max={field.max}
              step={field.step}
              defaultValue={settings[field.key]}
              onBlur={(e) => save({ [field.key]: Number(e.target.value) })}
              className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              {Math.round(settings[field.key] * 100)}%
            </span>
          </label>
        ))}
      </div>

      <label className="mt-4 flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={settings.autoPostExpenseOnFinalize}
          onChange={(e) => save({ autoPostExpenseOnFinalize: e.target.checked })}
          className="h-4 w-4 rounded border-border"
        />
        <span>Automatically post salary expense when a run is finalized</span>
      </label>

      {updateSettings.isPending ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Saving settings…
        </p>
      ) : null}
    </AuditSectionCard>
  );
}
