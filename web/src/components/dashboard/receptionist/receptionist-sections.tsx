"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { cn } from "@/lib/utils";
import { ManagementActionLink, ManagementPageHeader, ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { RECEPTIONIST_DASHBOARD_STATS, RECEPTIONIST_INQUIRIES, RECEPTIONIST_VISITORS } from "./receptionist-data";
import { Headphones, UserCheck, UserPlus } from "lucide-react";

const SK = <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

export function ReceptionistDashboard() {
  const loading = usePageLoading(400);
  if (loading) return SK;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Reception desk" description="Admissions, visitors, and support intake." />
      <div className="grid gap-4 sm:grid-cols-3">{RECEPTIONIST_DASHBOARD_STATS.map((s) => <ManagementStatCard key={s.id} {...s} />)}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ManagementActionLink href="/receptionist/admissions" label="Admissions desk" description="Inquiries and tours" icon={UserPlus} />
        <ManagementActionLink href="/receptionist/visitors" label="Visitors" description="Check-in and log" icon={UserCheck} />
        <ManagementActionLink href="/receptionist/support" label="Support" description="Open tickets" icon={Headphones} />
      </div>
    </div>
  );
}

export function ReceptionistAdmissions() {
  const loading = usePageLoading();
  if (loading) return SK;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Admissions desk" description="Walk-in and phone admission inquiries." action={<Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"><Plus className="mr-2 h-4 w-4" />New inquiry</Button>} />
      <div className="space-y-3">{RECEPTIONIST_INQUIRIES.map((i) => (
        <ManagementPanel key={i.id} className="flex flex-col gap-3 border border-border sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="font-bold">{i.name}</h3><p className="text-sm text-muted-foreground">{i.grade} · {i.phone} · {i.source} · {i.date}</p></div>
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", i.status === "new" ? "bg-brand-orange/15 text-brand-orange" : i.status === "tour_scheduled" ? "bg-brand-blue/15 text-brand-blue" : "bg-brand-purple/15 text-brand-purple")}>{i.status.replace(/_/g, " ")}</span>
        </ManagementPanel>
      ))}</div>
    </div>
  );
}

export function ReceptionistVisitors() {
  const loading = usePageLoading();
  if (loading) return SK;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Visitors" description="Log and badge visitors to the school." action={<Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"><Plus className="mr-2 h-4 w-4" />Check in visitor</Button>} />
      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground"><th className="px-4 py-3">Visitor</th><th className="px-4 py-3">Purpose</th><th className="px-4 py-3">Host</th><th className="px-4 py-3">Check-in</th><th className="px-4 py-3">Badge</th><th className="px-4 py-3" /></tr></thead>
          <tbody>{RECEPTIONIST_VISITORS.map((v) => (
            <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3 font-semibold">{v.name}</td><td className="px-4 py-3 text-muted-foreground">{v.purpose}</td><td className="px-4 py-3">{v.host}</td><td className="px-4 py-3">{v.checkIn}</td><td className="px-4 py-3 font-mono text-xs">{v.badge}</td>
              <td className="px-4 py-3">{!v.checkOut ? <Button size="sm" variant="outline" className="rounded-full">Check out</Button> : <span className="text-xs text-muted-foreground">Out {v.checkOut}</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}
