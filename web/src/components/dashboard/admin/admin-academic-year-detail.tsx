"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useAcademicYear, useClassesList, useUpdateAcademicYear } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementPanel } from "../management/management-ui";
import { AdminBackLink, AdminFormField, adminInputClass } from "./admin-workflow-ui";
import {
  ADMIN_ACADEMIC_YEARS,
  ADMIN_CLASSES,
  STATUS_STYLES,
  TERM_STATUS_STYLES,
} from "./admin-entities-data";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminAcademicYearDetail({ academicYearId }: { academicYearId: string }) {
  const loading = usePageLoading(300);
  const fallbackYear = ADMIN_ACADEMIC_YEARS.find((y) => y.id === academicYearId);
  const fallback = fallbackYear
    ? {
        ...fallbackYear,
        classCount: ADMIN_CLASSES.filter((c) => (c.academicYearId ?? "ay1") === fallbackYear.id).length,
      }
    : undefined;

  const { data: year, isFetching } = useAcademicYear(academicYearId, fallback);
  const { data: classes = ADMIN_CLASSES } = useClassesList(ADMIN_CLASSES);
  const updateYear = useUpdateAcademicYear(academicYearId);

  const [termName, setTermName] = useState("");
  const [termStart, setTermStart] = useState("");
  const [termEnd, setTermEnd] = useState("");

  const activeYear = year ?? fallback;

  if (loading || isFetching) {
    return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;
  }

  if (!activeYear) {
    return (
      <ManagementPanel className="border border-border text-center">
        <h2 className="text-lg font-bold">Academic year not found</h2>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href="/admin/academic-years">Back to academic years</Link>
        </Button>
      </ManagementPanel>
    );
  }

  const linkedClasses = classes.filter((c) => (c.academicYearId ?? "ay1") === activeYear.id);

  const setCurrent = async () => {
    await updateYear.mutateAsync({ action: "set_current" });
  };

  const setActiveTerm = async (termId: string) => {
    await updateYear.mutateAsync({ action: "set_active_term", termId });
  };

  const addTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateYear.mutateAsync({
      action: "add_term",
      term: { name: termName, startDate: termStart, endDate: termEnd },
    });
    setTermName("");
    setTermStart("");
    setTermEnd("");
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/academic-years" label="Back to academic years" />

      <ManagementPanel className="border border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{activeYear.name}</h1>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
                  STATUS_STYLES[activeYear.status],
                )}
              >
                {activeYear.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(activeYear.startDate)} → {formatDate(activeYear.endDate)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeYear.terms.length} terms · {activeYear.classCount ?? linkedClasses.length} classes
            </p>
          </div>
          {activeYear.status === "upcoming" ? (
            <Button
              variant="outline"
              className="rounded-full"
              disabled={updateYear.isPending}
              onClick={setCurrent}
            >
              Set as current year
            </Button>
          ) : activeYear.status === "active" ? (
            <Button variant="outline" className="rounded-full" disabled>
              Current year
            </Button>
          ) : null}
        </div>
      </ManagementPanel>

      <ManagementPanel className="border border-border">
        <h2 className="text-base font-bold">Terms & sessions</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage term dates and set the active term.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 pr-3 font-medium">Term</th>
                <th className="pb-3 pr-3 font-medium">Start</th>
                <th className="pb-3 pr-3 font-medium">End</th>
                <th className="pb-3 pr-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeYear.terms.map((term) => (
                <tr key={term.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-3 font-semibold">{term.name}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{formatDate(term.startDate)}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{formatDate(term.endDate)}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                        TERM_STATUS_STYLES[term.status],
                      )}
                    >
                      {term.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {term.status !== "active" && activeYear.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={updateYear.isPending}
                        onClick={() => setActiveTerm(term.id)}
                      >
                        Set active
                      </Button>
                    ) : term.status === "active" ? (
                      <span className="text-xs font-semibold text-green">Current term</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={addTerm} className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <AdminFormField label="Term name">
            <input
              required
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              className={adminInputClass}
              placeholder="Term 4"
            />
          </AdminFormField>
          <AdminFormField label="Start date">
            <input
              required
              type="date"
              value={termStart}
              onChange={(e) => setTermStart(e.target.value)}
              className={adminInputClass}
            />
          </AdminFormField>
          <AdminFormField label="End date">
            <input
              required
              type="date"
              value={termEnd}
              onChange={(e) => setTermEnd(e.target.value)}
              className={adminInputClass}
            />
          </AdminFormField>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={updateYear.isPending}
              className="h-10 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateYear.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add term
            </Button>
          </div>
        </form>
      </ManagementPanel>

      <ManagementPanel className="border border-border">
        <div className="flex items-center gap-2">
          <School className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold">Linked classes</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Classes created under this academic year</p>
        {linkedClasses.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No classes linked yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {linkedClasses.slice(0, 8).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Homeroom: {item.homeroomTeacher}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={`/admin/classes/${item.id}`}>View</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link href="/admin/classes/new">Create class for this year</Link>
        </Button>
      </ManagementPanel>
    </div>
  );
}
