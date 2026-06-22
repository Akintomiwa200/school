"use client";

import { RoleSidebar } from "./role-sidebar";
import { Header } from "./header";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/lib/utils";

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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
