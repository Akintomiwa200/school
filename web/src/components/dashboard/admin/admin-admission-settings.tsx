"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useAdmissionConfig, useUpdateAdmissionConfig } from "@/hooks/use-dashboard-data";
import {
  createDefaultAdmissionConfig,
  formatAdmissionFee,
  SCHOOL_TYPE_LABELS,
  type AdmissionConfig,
  type SchoolType,
} from "@/components/admissions/admissions-workflow-data";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { AdminFormField, adminInputClass, adminSelectClass } from "./admin-workflow-ui";

const FALLBACK = createDefaultAdmissionConfig("university");

export function AdminAdmissionSettings({ backHref }: { backHref: string }) {
  const loading = usePageLoading(300);
  const { data: config = FALLBACK, isFetching } = useAdmissionConfig();
  const saveConfig = useUpdateAdmissionConfig();
  const [draft, setDraft] = useState<AdmissionConfig>(FALLBACK);

  useEffect(() => {
    if (config) setDraft(config);
  }, [config]);

  if (loading || isFetching) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  const onSchoolTypeChange = async (schoolType: SchoolType) => {
    const updated = await saveConfig.mutateAsync({ action: "set_school_type", schoolType });
    if (updated && typeof updated === "object" && "schoolType" in updated) {
      setDraft(updated as AdmissionConfig);
    }
  };

  const onSave = async () => {
    await saveConfig.mutateAsync(draft);
  };

  const updateDoc = (index: number, field: "label" | "description" | "required", value: string | boolean) => {
    setDraft((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.map((doc, i) =>
        i === index ? { ...doc, [field]: value } : doc,
      ),
    }));
  };

  const addDoc = () => {
    setDraft((prev) => ({
      ...prev,
      requiredDocuments: [
        ...prev.requiredDocuments,
        { id: `doc-${Date.now()}`, label: "New document", description: "", required: true },
      ],
    }));
  };

  const removeDoc = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Admission configuration"
        description="Define school type, required uploads, screening rules, examination, and payment for all applicants."
        action={
          <Button asChild variant="outline" className="h-10 rounded-full px-5">
            <a href={backHref}>Back to pipeline</a>
          </Button>
        }
      />

      <ManagementPanel className="border border-border">
        <h2 className="text-base font-bold">Institution type</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Applicants see one intake configured for your school — not a secondary/university choice.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(SCHOOL_TYPE_LABELS) as SchoolType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => void onSchoolTypeChange(type)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                draft.schoolType === type
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <p className="font-semibold">{SCHOOL_TYPE_LABELS[type]}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {type === "university" ? "JAMB, O'Level, Post-UTME style" : "Age-appropriate intake"}
              </p>
            </button>
          ))}
        </div>
      </ManagementPanel>

      <div className="grid gap-5 lg:grid-cols-2">
        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Application &amp; payment</h2>
          <div className="mt-4 space-y-4">
            <AdminFormField label="School name">
              <input
                value={draft.schoolName}
                onChange={(e) => setDraft({ ...draft, schoolName: e.target.value })}
                className={adminInputClass}
              />
            </AdminFormField>
            <AdminFormField label="Application fee (NGN)">
              <input
                type="number"
                min={0}
                value={draft.applicationFee}
                onChange={(e) => setDraft({ ...draft, applicationFee: Number(e.target.value) })}
                className={adminInputClass}
              />
              <p className="mt-1 text-xs text-muted-foreground">Display: {formatAdmissionFee(draft.applicationFee)}</p>
            </AdminFormField>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.applicationOpen}
                onChange={(e) => setDraft({ ...draft, applicationOpen: e.target.checked })}
              />
              Applications open
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.enableRealTimePayment}
                onChange={(e) => setDraft({ ...draft, enableRealTimePayment: e.target.checked })}
              />
              Enable real-time payment step
            </label>
            <AdminFormField label="Payment instructions">
              <textarea
                value={draft.paymentInstructions}
                onChange={(e) => setDraft({ ...draft, paymentInstructions: e.target.value })}
                className={`${adminInputClass} min-h-[72px]`}
              />
            </AdminFormField>
          </div>
        </ManagementPanel>

        <ManagementPanel className="border border-border">
          <h2 className="text-base font-bold">Programs &amp; exam</h2>
          <div className="mt-4 space-y-4">
            <AdminFormField label={draft.programLabel}>
              <textarea
                value={draft.programOptions.join("\n")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    programOptions: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                  })
                }
                className={`${adminInputClass} min-h-[100px] font-mono text-xs`}
                placeholder="One program or grade per line"
              />
            </AdminFormField>
            <AdminFormField label="Exam subjects (comma-separated)">
              <input
                value={draft.examSubjects.join(", ")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    examSubjects: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                className={adminInputClass}
              />
            </AdminFormField>
            <div className="grid gap-4 sm:grid-cols-3">
              <AdminFormField label="Duration (min)">
                <input
                  type="number"
                  value={draft.examDurationMinutes}
                  onChange={(e) => setDraft({ ...draft, examDurationMinutes: Number(e.target.value) })}
                  className={adminInputClass}
                />
              </AdminFormField>
              <AdminFormField label="Pass score (%)">
                <input
                  type="number"
                  value={draft.examPassingScore}
                  onChange={(e) => setDraft({ ...draft, examPassingScore: Number(e.target.value) })}
                  className={adminInputClass}
                />
              </AdminFormField>
              <AdminFormField label="Qs / subject">
                <input
                  type="number"
                  value={draft.examQuestionsPerSubject}
                  onChange={(e) => setDraft({ ...draft, examQuestionsPerSubject: Number(e.target.value) })}
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>
            <AdminFormField label="Department name">
              <input
                value={draft.departmentName}
                onChange={(e) => setDraft({ ...draft, departmentName: e.target.value })}
                className={adminInputClass}
              />
            </AdminFormField>
          </div>
        </ManagementPanel>
      </div>

      <ManagementPanel className="border border-border">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">Required uploads</h2>
            <p className="text-sm text-muted-foreground">Applicants upload these after payment. You vet each file before exam eligibility.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addDoc} className="rounded-full">
            <Plus className="mr-1 h-4 w-4" />
            Add document
          </Button>
        </div>
        <ul className="mt-4 space-y-3">
          {draft.requiredDocuments.map((doc, index) => (
            <li key={doc.id} className="rounded-xl border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminFormField label="Label">
                  <input value={doc.label} onChange={(e) => updateDoc(index, "label", e.target.value)} className={adminInputClass} />
                </AdminFormField>
                <AdminFormField label="Description">
                  <input value={doc.description} onChange={(e) => updateDoc(index, "description", e.target.value)} className={adminInputClass} />
                </AdminFormField>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={doc.required} onChange={(e) => updateDoc(index, "required", e.target.checked)} />
                  Required for screening
                </label>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeDoc(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </ManagementPanel>

      <ManagementPanel className="border border-border">
        <h2 className="text-base font-bold">Screening checklist</h2>
        <p className="mt-1 text-sm text-muted-foreground">Internal rules staff verify before marking applicants exam-eligible (e.g. 5 O&apos;Level credits, JAMB cut-off).</p>
        <textarea
          value={draft.screeningRules.map((r) => `${r.label}: ${r.description}`).join("\n")}
          onChange={(e) =>
            setDraft({
              ...draft,
              screeningRules: e.target.value
                .split("\n")
                .filter(Boolean)
                .map((line, i) => {
                  const [label, ...rest] = line.split(":");
                  return {
                    id: `rule-${i}`,
                    label: (label ?? `Rule ${i + 1}`).trim(),
                    description: rest.join(":").trim() || "Verify during document review",
                  };
                }),
            })
          }
          className={`${adminInputClass} mt-4 min-h-[120px] font-mono text-xs`}
          placeholder="JAMB minimum: UTME score meets cut-off&#10;O'Level: Five credits incl. English & Maths"
        />
      </ManagementPanel>

      <ManagementPanel className="border border-border">
        <h2 className="text-base font-bold">Applicant sign-in options</h2>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.enableGoogleAuth}
              onChange={(e) => setDraft({ ...draft, enableGoogleAuth: e.target.checked })}
            />
            Allow Google sign-in on application
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.enableAppleAuth}
              onChange={(e) => setDraft({ ...draft, enableAppleAuth: e.target.checked })}
            />
            Allow Apple sign-in (when configured)
          </label>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          After admission, students use their email as username and first name as initial password (changeable on first login).
        </p>
      </ManagementPanel>

      <ManagementPanel className="border border-border">
        <AdminFormField label="Welcome message (shown on apply page)">
          <textarea
            value={draft.welcomeMessage}
            onChange={(e) => setDraft({ ...draft, welcomeMessage: e.target.value })}
            className={`${adminInputClass} min-h-[80px]`}
          />
        </AdminFormField>
        <Button onClick={onSave} disabled={saveConfig.isPending} className="mt-4 h-10 rounded-full bg-primary px-6 text-primary-foreground">
          {saveConfig.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save configuration
        </Button>
      </ManagementPanel>
    </div>
  );
}
