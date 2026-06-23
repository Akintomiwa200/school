"use client";

import { getDashboardPageMeta } from "@/components/dashboard/page-meta";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type NavbarModal = "settings" | null;

type NavbarModalsProps = {
  activeModal: NavbarModal;
  onOpenChange: (modal: NavbarModal) => void;
};

export function NavbarModals({ activeModal, onOpenChange }: NavbarModalsProps) {
  const settingsMeta = getDashboardPageMeta("/shared/settings");

  return (
    <Dialog
      open={activeModal === "settings"}
      onOpenChange={(open) => onOpenChange(open ? "settings" : null)}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{settingsMeta.title}</DialogTitle>
          <DialogDescription>{settingsMeta.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {(settingsMeta.sections ?? []).map((section) => (
            <div key={section.title} className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">{section.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
