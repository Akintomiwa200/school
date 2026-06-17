"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="lg:hidden">
        <span className="text-lg font-bold">School LMS</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{session?.user?.name}</span>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
