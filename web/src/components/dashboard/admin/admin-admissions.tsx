"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, GraduationCap, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useAdmissionsList } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import {
  ADMISSION_STATUS_LABELS,
  ADMISSION_STATUS_STYLES,
  formatAdmissionFee,
  type AdmissionStatus,
  type InstitutionType,
} from "@/components/admissions/admissions-workflow-data";
import { ManagementPageHeader, ManagementPanel, ManagementStatCard } from "../management/management-ui";
import {
  ADMIN_PAGE_SIZE,
  AdminFilterPills,
  AdminSearchBar,
  AdminTablePagination,
} from "./admin-list-ui";
import { ADMIN_ADMISSIONS } from "./admin-entities-data";

type StatusFilter = "all" | AdmissionStatus;
type TypeFilter = "all" | InstitutionType;

export function AdminAdmissions() {
  const { data: admissions = ADMIN_ADMISSIONS, isFetching } = useAdmissionsList(ADMIN_ADMISSIONS);
  const loading = usePageLoading(400) || isFetching;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, typeFilter]);

  const stats = useMemo(
    () => ({
      total: admissions.length,
      pendingPayment: admissions.filter((a) => a.paymentStatus === "pending").length,
      awaitingExam: admissions.filter((a) => a.paymentStatus === "paid" && a.examStatus === "not_scheduled").length,
      approved: admissions.filter((a) => a.status === "approved").length,
    }),
    [admissions],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return admissions.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (typeFilter !== "all" && a.institutionType !== typeFilter) return false;
      if (!q) return true;
      return (
        a.applicantName.toLowerCase().includes(q) ||
        a.guardian.toLowerCase().includes(q) ||
        a.gradeApplied.toLowerCase().includes(q) ||
        a.reference.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    });
  }, [admissions, query, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE);

  if (loading) return <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Admissions"
        description="Review applications, manage payments and exams, approve candidates, then add them as students."
        action={
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline" className="h-10 rounded-full px-5">
              <Link href="/admin/admissions/settings">Configure intake</Link>
            </Button>
            <Button asChild variant="outline" className="h-10 rounded-full px-5">
              <Link href="/admissions/apply" target="_blank">Public apply page</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ManagementStatCard label="Applications" value={String(stats.total)} hint="All intakes" tone="purple" icon={School} />
        <ManagementStatCard label="Awaiting payment" value={String(stats.pendingPayment)} hint="Fee not paid" tone="orange" icon={School} />
        <ManagementStatCard label="Needs exam setup" value={String(stats.awaitingExam)} hint="Paid, no exam yet" tone="blue" icon={GraduationCap} />
        <ManagementStatCard label="Ready to enroll" value={String(stats.approved)} hint="Approved, not yet students" tone="green" icon={GraduationCap} />
      </div>

      <ManagementPanel className="border border-border">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pipeline</p>
            <h2 className="mt-1 text-lg font-bold">{filtered.length} applications</h2>
          </div>
          <AdminSearchBar value={query} onChange={setQuery} placeholder="Search name, reference, email…" />
          <AdminFilterPills
            options={[
              { id: "all", label: "All types" },
              { id: "secondary", label: "Secondary" },
              { id: "university", label: "University" },
            ]}
            value={typeFilter}
            onChange={setTypeFilter}
          />
          <AdminFilterPills
            options={[
              { id: "all", label: "All statuses" },
              { id: "payment_pending", label: "Payment pending" },
              { id: "paid", label: "Paid" },
              { id: "exam_scheduled", label: "Exam scheduled" },
              { id: "exam_completed", label: "Exam done" },
              { id: "approved", label: "Approved" },
              { id: "enrolled", label: "Enrolled" },
              { id: "rejected", label: "Rejected" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </ManagementPanel>

      <div className="space-y-3">
        {paginated.length === 0 ? (
          <ManagementPanel className="border border-border text-center text-sm text-muted-foreground">
            No applications match your filters.
          </ManagementPanel>
        ) : (
          paginated.map((app) => (
            <ManagementPanel
              key={app.id}
              className="flex flex-col gap-4 border border-border sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{app.applicantName}</h3>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      ADMISSION_STATUS_STYLES[app.status],
                    )}
                  >
                    {ADMISSION_STATUS_LABELS[app.status]}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
                    {app.institutionType}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {app.gradeApplied} · {app.reference} · {formatAdmissionFee(app.paymentAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {app.email} · Guardian: {app.guardian}
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="h-9 shrink-0 rounded-xl px-4">
                <Link href={`/admin/admissions/${app.id}`}>
                  Manage
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </ManagementPanel>
          ))
        )}
      </div>

      {filtered.length > 0 ? (
        <ManagementPanel className="border border-border p-0">
          <AdminTablePagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={ADMIN_PAGE_SIZE}
            onPageChange={setPage}
          />
        </ManagementPanel>
      ) : null}
    </div>
  );
}
