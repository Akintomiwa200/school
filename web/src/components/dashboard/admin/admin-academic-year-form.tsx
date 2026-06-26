"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateAcademicYear } from "@/hooks/use-dashboard-data";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { AdminBackLink, AdminFormField, adminInputClass } from "./admin-workflow-ui";

export function AdminAcademicYearForm() {
  const router = useRouter();
  const createYear = useCreateAcademicYear();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [termCount, setTermCount] = useState("3");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createYear.mutateAsync({
      name,
      startDate,
      endDate,
      termCount: Number(termCount),
    });
    router.push(`/admin/academic-years/${created.id}`);
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/academic-years" label="Back to academic years" />
      <ManagementPageHeader
        title="New academic year"
        description="Create a school year with automatically generated terms."
      />
      <ManagementPanel className="mx-auto max-w-2xl border border-border">
        <form onSubmit={onSubmit} className="space-y-5">
          <AdminFormField label="Year name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={adminInputClass}
              placeholder="2026–2027"
            />
          </AdminFormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminFormField label="Start date">
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={adminInputClass}
              />
            </AdminFormField>
            <AdminFormField label="End date">
              <input
                required
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={adminInputClass}
              />
            </AdminFormField>
          </div>
          <AdminFormField label="Number of terms">
            <input
              required
              type="number"
              min={1}
              max={6}
              value={termCount}
              onChange={(e) => setTermCount(e.target.value)}
              className={adminInputClass}
            />
          </AdminFormField>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="submit"
              disabled={createYear.isPending}
              className="h-10 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {createYear.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create academic year
            </Button>
            <Button type="button" variant="outline" asChild className="h-10 rounded-full px-6">
              <Link href="/admin/academic-years">Cancel</Link>
            </Button>
          </div>
        </form>
      </ManagementPanel>
    </div>
  );
}
