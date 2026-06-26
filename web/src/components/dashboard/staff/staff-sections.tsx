"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import {
  useHostelRooms,
  useInventoryItems,
  useStaffAttendance,
  useTransportRoutes,
} from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { ManagementActionLink, ManagementPageHeader, ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { STAFF_ATTENDANCE, STAFF_DASHBOARD_STATS, STAFF_HOSTEL_ROOMS, STAFF_INVENTORY, STAFF_ROUTES } from "./staff-data";
import { Bus, ClipboardCheck, Home, Package } from "lucide-react";

const SK = <div className="h-64 animate-pulse rounded-[20px] bg-muted" />;

export function StaffDashboard() {
  const loading = usePageLoading(400);
  if (loading) return SK;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Operations overview" description="Transport, hostel, inventory, and staff attendance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{STAFF_DASHBOARD_STATS.map((s) => <ManagementStatCard key={s.id} {...s} />)}</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementActionLink href="/staff/transport" label="Transport" description="Routes and assignments" icon={Bus} />
        <ManagementActionLink href="/staff/hostel" label="Hostel" description="Rooms and residents" icon={Home} />
        <ManagementActionLink href="/staff/inventory" label="Inventory" description="Stock and requests" icon={Package} />
        <ManagementActionLink href="/staff/attendance" label="Attendance" description="Daily check-in" icon={ClipboardCheck} />
      </div>
    </div>
  );
}

export function StaffTransport() {
  const { data: routes = STAFF_ROUTES, isFetching } = useTransportRoutes(STAFF_ROUTES);
  const loading = usePageLoading() || isFetching;
  if (loading) return SK;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Transport" description="Bus routes, drivers, and student pickups." />
      <div className="space-y-3">{routes.map((r) => (
        <ManagementPanel key={r.id} className="flex flex-col gap-3 border border-border sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="font-bold">{r.name}</h3><p className="text-sm text-muted-foreground">Driver: {r.driver} · Departs {r.departure} · {r.students} students</p></div>
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", r.status === "on_time" ? "bg-green/15 text-green" : "bg-brand-orange/15 text-brand-orange")}>{r.status.replace("_", " ")}</span>
        </ManagementPanel>
      ))}</div>
    </div>
  );
}

export function StaffHostel() {
  const { data: rooms = STAFF_HOSTEL_ROOMS, isFetching } = useHostelRooms(STAFF_HOSTEL_ROOMS);
  const loading = usePageLoading() || isFetching;
  if (loading) return SK;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Hostel" description="Boarding rooms, allocations, and maintenance." action={<Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"><Plus className="mr-2 h-4 w-4" />Assign resident</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rooms.map((r) => (
        <ManagementPanel key={r.id} className="border border-border">
          <h3 className="font-bold">{r.block} · {r.room}</h3>
          <p className="mt-2 text-sm">{r.occupied}/{r.beds} beds occupied</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand-purple" style={{ width: `${(r.occupied / r.beds) * 100}%` }} /></div>
          <Button variant="outline" className="mt-4 w-full rounded-full">Manage room</Button>
        </ManagementPanel>
      ))}</div>
    </div>
  );
}

export function StaffInventory() {
  const { data: inventory = STAFF_INVENTORY, isFetching } = useInventoryItems(STAFF_INVENTORY);
  const loading = usePageLoading() || isFetching;
  if (loading) return SK;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Inventory" description="School supplies and asset tracking." action={<Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"><Plus className="mr-2 h-4 w-4" />Add item</Button>} />
      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead><tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground"><th className="px-4 py-3">Item</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody>{inventory.map((i) => (
            <tr key={i.id} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3 font-semibold">{i.item}</td><td className="px-4 py-3 text-muted-foreground">{i.category}</td><td className="px-4 py-3 font-bold">{i.quantity}</td><td className="px-4 py-3 text-muted-foreground">{i.location}</td>
              <td className="px-4 py-3"><span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", i.status === "in_stock" ? "bg-green/15 text-green" : i.status === "low" ? "bg-brand-orange/15 text-brand-orange" : "bg-destructive/15 text-destructive")}>{i.status.replace("_", " ")}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </ManagementPanel>
    </div>
  );
}

export function StaffAttendance() {
  const { data: attendance = STAFF_ATTENDANCE, isFetching } = useStaffAttendance(STAFF_ATTENDANCE);
  const loading = usePageLoading() || isFetching;
  if (loading) return SK;
  return (
    <div className="space-y-6">
      <ManagementPageHeader title="Staff attendance" description="Mark attendance for transport, hostel, or general duties." />
      <div className="space-y-3">{attendance.map((a) => (
        <ManagementPanel key={a.id} className="flex flex-col gap-3 border border-border sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="font-bold">{a.group}</h3><p className="text-sm text-muted-foreground">{a.date}</p></div>
          {a.marked ? <span className="text-sm font-semibold text-green">{a.present} present · {a.absent} absent</span> : <Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">Mark check-in</Button>}
        </ManagementPanel>
      ))}</div>
    </div>
  );
}
