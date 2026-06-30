"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PayrollRun } from "./accountant-data";
import { FinanceFilterSelect, FinancePanel } from "./accountant-ui";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function PayrollRunDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  existingRuns,
  defaultDuplicateId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { period: string; notes: string; duplicateFromRunId?: string }) => void;
  isPending: boolean;
  existingRuns: PayrollRun[];
  defaultDuplicateId?: string;
}) {
  const now = new Date();
  const [month, setMonth] = useState(MONTHS[now.getMonth()]);
  const [year, setYear] = useState(String(now.getFullYear()));
  const [notes, setNotes] = useState("");
  const [duplicateFrom, setDuplicateFrom] = useState(defaultDuplicateId ?? "");

  const period = `${month} ${year}`;
  const duplicateOptions = useMemo(
    () => [
      { id: "", label: "Start fresh (auto-generate staff)" },
      ...existingRuns
        .filter((run) => run.status === "completed" || run.status === "processing")
        .map((run) => ({ id: run.id, label: `Copy from ${run.period}` })),
    ],
    [existingRuns],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <FinancePanel className="w-full max-w-md border border-border shadow-xl">
        <h2 className="text-lg font-bold">Generate payroll run</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new monthly run. Salaries auto-calculate from staff roles and payroll settings.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <FinanceFilterSelect
            label="Month"
            value={month}
            onChange={setMonth}
            options={MONTHS.map((label) => ({ id: label, label }))}
          />
          <FinanceFilterSelect
            label="Year"
            value={year}
            onChange={setYear}
            options={[String(now.getFullYear() - 1), String(now.getFullYear()), String(now.getFullYear() + 1)].map(
              (label) => ({ id: label, label }),
            )}
          />
        </div>

        <div className="mt-3">
          <FinanceFilterSelect
            label="Template"
            value={duplicateFrom}
            onChange={setDuplicateFrom}
            options={duplicateOptions}
            className="w-full"
          />
        </div>

        <label className="mt-3 block text-sm">
          <span className="mb-1.5 block font-medium">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. Includes mid-year adjustments"
          />
        </label>

        <p className="mt-3 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Period: <span className="font-semibold text-foreground">{period}</span>
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" className="rounded-full px-4" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className="rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
            disabled={isPending}
            onClick={() =>
              onSubmit({
                period,
                notes,
                duplicateFromRunId: duplicateFrom || undefined,
              })
            }
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Generate run
          </Button>
        </div>
      </FinancePanel>
    </div>
  );
}
