"use client";

import { Check, Monitor, Moon, PanelLeft, PanelLeftClose, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCENT_OPTIONS,
  DENSITY_OPTIONS,
  FONT_SIZES,
  SIDEBAR_STYLES,
  type AppearanceForm,
} from "./settings-data";

function AppearanceGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-muted/10 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function SelectionBadge({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-purple text-white shadow-sm">
      <Check className="h-3 w-3" strokeWidth={3} />
    </span>
  );
}

function ColorModePreview({ mode }: { mode: AppearanceForm["theme"] }) {
  const shell =
    mode === "dark"
      ? "border-slate-700 bg-slate-900"
      : mode === "light"
        ? "border-slate-200 bg-white"
        : "border-slate-300 bg-gradient-to-br from-white via-slate-50 to-slate-200";

  const sidebar =
    mode === "dark" ? "bg-slate-800" : mode === "light" ? "bg-slate-100" : "bg-slate-200/80";
  const card = mode === "dark" ? "bg-slate-700" : "bg-white";
  const line = mode === "dark" ? "bg-slate-600" : "bg-slate-200";

  return (
    <div className={cn("relative h-[4.5rem] overflow-hidden rounded-xl border p-2", shell)}>
      <div className="flex h-full gap-1.5">
        <div className={cn("w-5 shrink-0 rounded-md", sidebar)} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className={cn("h-2 w-8 rounded-full", line)} />
          <div className={cn("flex-1 rounded-md border border-black/5", card)} />
        </div>
      </div>
      {mode === "system" ? (
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/10 px-1 py-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-300">
          Auto
        </span>
      ) : null}
    </div>
  );
}

const THEME_META: Record<
  AppearanceForm["theme"],
  { label: string; hint: string; icon: React.ComponentType<{ className?: string }> }
> = {
  system: { label: "System", hint: "Match device", icon: Monitor },
  light: { label: "Light", hint: "Bright & clean", icon: Sun },
  dark: { label: "Dark", hint: "Easy on eyes", icon: Moon },
};

export function ColorModePicker({
  value,
  onChange,
}: {
  value: AppearanceForm["theme"];
  onChange: (value: AppearanceForm["theme"]) => void;
}) {
  return (
    <AppearanceGroup title="Color mode" description="Choose how the portal looks in light and dark environments.">
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(THEME_META) as AppearanceForm["theme"][]).map((mode) => {
          const meta = THEME_META[mode];
          const Icon = meta.icon;
          const active = value === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => onChange(mode)}
              className={cn(
                "relative rounded-2xl border p-3 text-left transition-all",
                active
                  ? "border-brand-purple bg-brand-purple/8 shadow-[0_0_0_1px_rgba(93,33,208,0.25)]"
                  : "border-border bg-card hover:border-brand-purple/30 hover:bg-muted/30",
              )}
            >
              <SelectionBadge active={active} />
              <ColorModePreview mode={mode} />
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg",
                    active ? "bg-brand-purple/15 text-brand-purple" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className={cn("text-sm font-semibold", active ? "text-brand-purple" : "text-foreground")}>
                    {meta.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{meta.hint}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </AppearanceGroup>
  );
}

export function AccentColorPicker({
  value,
  onChange,
}: {
  value: AppearanceForm["accent"];
  onChange: (value: AppearanceForm["accent"]) => void;
}) {
  return (
    <AppearanceGroup title="Accent color" description="Used for buttons, links, and active navigation states.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACCENT_OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value as AppearanceForm["accent"])}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 transition-all",
                active
                  ? "border-brand-purple bg-brand-purple/8"
                  : "border-border bg-card hover:border-brand-purple/25 hover:bg-muted/20",
              )}
            >
              <span className="relative">
                <span
                  className="block h-10 w-10 rounded-full shadow-sm ring-4 ring-background"
                  style={{ backgroundColor: option.color }}
                />
                {active ? (
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-purple text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                ) : null}
              </span>
              <span className={cn("text-sm font-medium", active ? "text-brand-purple" : "text-foreground")}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </AppearanceGroup>
  );
}

const FONT_PREVIEW: Record<AppearanceForm["fontSize"], string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function FontSizePicker({
  value,
  onChange,
}: {
  value: AppearanceForm["fontSize"];
  onChange: (value: AppearanceForm["fontSize"]) => void;
}) {
  return (
    <AppearanceGroup title="Font size" description="Adjust base text size across the dashboard.">
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-1.5">
        {FONT_SIZES.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value as AppearanceForm["fontSize"])}
              className={cn(
                "rounded-xl px-3 py-3 transition-all",
                active ? "bg-brand-purple text-white shadow-sm" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <p className={cn("font-bold leading-none", FONT_PREVIEW[option.value as AppearanceForm["fontSize"]])}>
                Aa
              </p>
              <p className={cn("mt-2 text-xs font-medium", active ? "text-white/90" : "text-muted-foreground")}>
                {option.label}
              </p>
            </button>
          );
        })}
      </div>
    </AppearanceGroup>
  );
}

function DensityPreview({ density }: { density: AppearanceForm["density"] }) {
  const gaps =
    density === "compact" ? "gap-0.5" : density === "spacious" ? "gap-2" : "gap-1";
  const heights =
    density === "compact" ? "h-2" : density === "spacious" ? "h-3.5" : "h-2.5";

  return (
    <div className={cn("flex flex-col", gaps)}>
      <div className={cn("w-full rounded bg-brand-purple/25", heights)} />
      <div className={cn("w-4/5 rounded bg-muted-foreground/20", heights)} />
      <div className={cn("w-3/5 rounded bg-muted-foreground/15", heights)} />
    </div>
  );
}

export function DensityPicker({
  value,
  onChange,
}: {
  value: AppearanceForm["density"];
  onChange: (value: AppearanceForm["density"]) => void;
}) {
  return (
    <AppearanceGroup title="Layout density" description="Control spacing between cards, lists, and page sections.">
      <div className="grid gap-3 sm:grid-cols-3">
        {DENSITY_OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value as AppearanceForm["density"])}
              className={cn(
                "relative rounded-2xl border p-3 text-left transition-all",
                active
                  ? "border-brand-purple bg-brand-purple/8"
                  : "border-border bg-card hover:border-brand-purple/25 hover:bg-muted/20",
              )}
            >
              <SelectionBadge active={active} />
              <div className="rounded-xl border border-border bg-background p-3">
                <DensityPreview density={option.value as AppearanceForm["density"]} />
              </div>
              <p className={cn("mt-3 text-sm font-semibold", active ? "text-brand-purple" : "text-foreground")}>
                {option.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{option.hint}</p>
            </button>
          );
        })}
      </div>
    </AppearanceGroup>
  );
}

function SidebarPreview({ style }: { style: AppearanceForm["sidebarStyle"] }) {
  const wide = style === "expanded" || style === "auto";
  return (
    <div className="flex h-12 items-stretch gap-1.5 rounded-xl border border-border bg-background p-1.5">
      <div className={cn("rounded-md bg-brand-purple/20 transition-all", wide ? "w-8" : "w-3")} />
      <div className="flex flex-1 flex-col justify-center gap-1">
        <div className="h-1.5 w-8 rounded-full bg-muted-foreground/25" />
        <div className="h-4 flex-1 rounded-md bg-muted/60" />
      </div>
    </div>
  );
}

const SIDEBAR_META: Record<
  AppearanceForm["sidebarStyle"],
  { label: string; hint: string; icon: React.ComponentType<{ className?: string }> }
> = {
  expanded: { label: "Always expanded", hint: "Full labels visible", icon: PanelLeft },
  collapsed: { label: "Always collapsed", hint: "Icons only", icon: PanelLeftClose },
  auto: { label: "Auto", hint: "Remember last state", icon: Monitor },
};

export function SidebarBehaviorPicker({
  value,
  onChange,
}: {
  value: AppearanceForm["sidebarStyle"];
  onChange: (value: AppearanceForm["sidebarStyle"]) => void;
}) {
  return (
    <AppearanceGroup title="Sidebar behavior" description="Choose how the left navigation panel is displayed on desktop.">
      <div className="grid gap-3 sm:grid-cols-3">
        {SIDEBAR_STYLES.map((option) => {
          const meta = SIDEBAR_META[option.value as AppearanceForm["sidebarStyle"]];
          const Icon = meta.icon;
          const active = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value as AppearanceForm["sidebarStyle"])}
              className={cn(
                "relative rounded-2xl border p-3 text-left transition-all",
                active
                  ? "border-brand-purple bg-brand-purple/8"
                  : "border-border bg-card hover:border-brand-purple/25 hover:bg-muted/20",
              )}
            >
              <SelectionBadge active={active} />
              <SidebarPreview style={option.value as AppearanceForm["sidebarStyle"]} />
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg",
                    active ? "bg-brand-purple/15 text-brand-purple" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className={cn("text-sm font-semibold", active ? "text-brand-purple" : "text-foreground")}>
                    {meta.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{meta.hint}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </AppearanceGroup>
  );
}
