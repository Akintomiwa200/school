"use client";

import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui.store";
import { UserRole } from "@/shared";
import { getLoginPathForRole } from "@/shared/permissions";

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    toast.success("Signed out");
    router.push(getLoginPathForRole(role));
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted lg:hidden"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          <Menu size={18} />
        </button>
        <span className="font-display text-lg font-bold text-brand-purple lg:hidden">Pathway Academy</span>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="hidden text-sm text-muted-foreground sm:inline">{session?.user?.name}</span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
