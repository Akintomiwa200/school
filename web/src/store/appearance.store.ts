import { create } from "zustand";
import {
  getDefaultAccessibility,
  getDefaultAppearance,
  type AccessibilityForm,
  type AppearanceForm,
} from "@/components/dashboard/settings/settings-data";
import {
  APPEARANCE_STORAGE_KEY,
  ACCESSIBILITY_STORAGE_KEY,
  applyAccessibility,
  applyAppearance,
} from "@/components/dashboard/settings/appearance-settings";

type AppearanceState = {
  appearance: AppearanceForm;
  accessibility: AccessibilityForm;
  hydrated: boolean;
  hydrate: () => void;
  setAppearance: (appearance: AppearanceForm, setTheme?: (theme: string) => void) => void;
  patchAppearance: <K extends keyof AppearanceForm>(
    key: K,
    value: AppearanceForm[K],
    setTheme?: (theme: string) => void,
  ) => void;
  setAccessibility: (accessibility: AccessibilityForm) => void;
  patchAccessibility: <K extends keyof AccessibilityForm>(
    key: K,
    value: AccessibilityForm[K],
  ) => void;
  applyToDocument: (setTheme?: (theme: string) => void) => void;
};

function loadAppearance(): AppearanceForm {
  if (typeof window === "undefined") return getDefaultAppearance();
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return getDefaultAppearance();
    return { ...getDefaultAppearance(), ...JSON.parse(raw) };
  } catch {
    return getDefaultAppearance();
  }
}

function loadAccessibility(): AccessibilityForm {
  if (typeof window === "undefined") return getDefaultAccessibility();
  try {
    const raw = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (!raw) return getDefaultAccessibility();
    return { ...getDefaultAccessibility(), ...JSON.parse(raw) };
  } catch {
    return getDefaultAccessibility();
  }
}

export const useAppearanceStore = create<AppearanceState>((set, get) => ({
  appearance: getDefaultAppearance(),
  accessibility: getDefaultAccessibility(),
  hydrated: false,

  hydrate: () => {
    const appearance = loadAppearance();
    const accessibility = loadAccessibility();
    set({ appearance, accessibility, hydrated: true });
  },

  setAppearance: (appearance, setTheme) => {
    set({ appearance });
    applyAppearance(appearance, setTheme);
  },

  patchAppearance: (key, value, setTheme) => {
    const appearance = { ...get().appearance, [key]: value };
    get().setAppearance(appearance, setTheme);
  },

  setAccessibility: (accessibility) => {
    set({ accessibility });
    applyAccessibility(accessibility);
  },

  patchAccessibility: (key, value) => {
    const accessibility = { ...get().accessibility, [key]: value };
    get().setAccessibility(accessibility);
  },

  applyToDocument: (setTheme) => {
    const { appearance, accessibility } = get();
    applyAppearance(appearance, setTheme);
    applyAccessibility(accessibility);
  },
}));

export function getAppearanceInitScript(): string {
  return `(function(){try{var a=localStorage.getItem("${APPEARANCE_STORAGE_KEY}");var x=a?JSON.parse(a):null;var r=document.documentElement;var b=document.body;var fs={sm:"93.75%",md:"100%",lg:"106.25%"};var acc={purple:{b:"#5d21d0",p:"#5d21d0"},blue:{b:"#2563eb",p:"#2563eb"},green:{b:"#16a34a",p:"#16a34a"},orange:{b:"#ea580c",p:"#ea580c"}};if(x){if(x.theme==="dark")r.classList.add("dark");else if(x.theme==="light")r.classList.remove("dark");else if(x.theme==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches)r.classList.add("dark");var f=fs[x.fontSize]||"100%";r.style.fontSize=f;if(b)b.style.fontSize=f;if(x.accent&&acc[x.accent]){r.dataset.accent=x.accent;r.style.setProperty("--color-brand-purple",acc[x.accent].b);r.style.setProperty("--color-primary",acc[x.accent].p);r.style.setProperty("--color-ring",acc[x.accent].p);r.style.setProperty("--color-sidebar-primary",acc[x.accent].p);}if(x.density){r.dataset.density=x.density;var den=x.density==="compact"?"1rem":x.density==="spacious"?"2rem":"1.5rem";r.style.setProperty("--app-main-padding",den);r.style.setProperty("--app-density-scale",x.density==="compact"?"0.88":x.density==="spacious"?"1.14":"1");}if(x.sidebarStyle)r.dataset.sidebar=x.sidebarStyle;}var c=localStorage.getItem("${ACCESSIBILITY_STORAGE_KEY}");if(c){var s=JSON.parse(c);r.classList.toggle("reduce-motion",!!s.reducedMotion);r.classList.toggle("high-contrast",!!s.highContrast);r.classList.toggle("large-targets",!!s.largerClickTargets);r.classList.toggle("underline-links",!!s.underlineLinks);r.classList.toggle("enhanced-focus",s.focusIndicators!==false);}}catch(e){}})();`;
}
