import { create } from "zustand";

export type SidebarBehavior = "expanded" | "collapsed" | "auto";

export const SIDEBAR_AUTO_KEY = "school-lms-sidebar-auto-expanded";

interface UIState {
  sidebarOpen: boolean;
  sidebarBehavior: SidebarBehavior;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarBehavior: (behavior: SidebarBehavior) => void;
}

function readAutoSidebarExpanded(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SIDEBAR_AUTO_KEY) !== "false";
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  sidebarBehavior: "auto",

  toggleSidebar: () => {
    const next = !get().sidebarOpen;
    if (get().sidebarBehavior === "auto" && typeof window !== "undefined") {
      localStorage.setItem(SIDEBAR_AUTO_KEY, String(next));
    }
    set({ sidebarOpen: next });
  },

  setSidebarOpen: (open) => {
    if (get().sidebarBehavior === "auto" && typeof window !== "undefined") {
      localStorage.setItem(SIDEBAR_AUTO_KEY, String(open));
    }
    set({ sidebarOpen: open });
  },

  setSidebarBehavior: (behavior) => {
    set({ sidebarBehavior: behavior });

    if (behavior === "expanded") {
      set({ sidebarOpen: true });
      return;
    }

    if (behavior === "collapsed") {
      set({ sidebarOpen: false });
      return;
    }

    set({ sidebarOpen: readAutoSidebarExpanded() });
  },
}));
