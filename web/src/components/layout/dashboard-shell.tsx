"use client";

import { RoleSidebar } from "./role-sidebar";
import { Header } from "./header";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/lib/utils";
import { RealtimeNotificationsBridge } from "@/components/dashboard/notifications";
import { OnlineClassesStreamBridge } from "@/components/dashboard/online-classes";
import { MessagesRealtimeBridge } from "@/components/dashboard/messages/messages-realtime-bridge";
import { TeacherRealtimeBridge } from "@/components/dashboard/teacher/teacher-realtime-bridge";
import { HrRealtimeBridge } from "@/components/dashboard/hr/hr-realtime-bridge";
import { SuperAdminRealtimeBridge } from "@/components/dashboard/super-admin/super-admin-realtime-bridge";
import { AdmissionsRealtimeBridge } from "@/components/admissions/admissions-realtime-bridge";
import { ContactRealtimeBridge } from "@/components/contact/contact-realtime-bridge";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RoleSidebar />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-[280px]" : "lg:ml-16",
        )}
      >
        <Header />
        <RealtimeNotificationsBridge />
        <OnlineClassesStreamBridge />
        <MessagesRealtimeBridge />
        <TeacherRealtimeBridge />
        <HrRealtimeBridge />
        <SuperAdminRealtimeBridge />
        <AdmissionsRealtimeBridge />
        <ContactRealtimeBridge />
        <main className="dashboard-main flex-1 overflow-y-auto">
          <div className="dashboard-content dashboard-density-target mx-auto min-w-0 w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
