import { cn } from "@/lib/utils";
import type { SettingsTab } from "./settings-data";

export function SettingsPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[20px] bg-card text-card-foreground shadow-float",
        className,
      )}
      {...props}
    />
  );
}

export function SettingsNavItem({
  tab,
  active,
  onClick,
}: {
  tab: SettingsTab;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
        active
          ? "bg-brand-purple/10 text-brand-purple"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          active ? "bg-brand-purple/15 text-brand-purple" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 truncate">{tab.label}</span>
    </button>
  );
}

export function SettingsField({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

const fieldClassName =
  "flex h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-purple/50 focus:ring-2 focus:ring-brand-purple/20";

export function SettingsInput({
  id,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={fieldClassName}
    />
  );
}

export function SettingsSelect({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(fieldClassName, "appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10")}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function SettingsToggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border px-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand-purple" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function SettingsSectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function SettingsChoiceGroup<T extends string>({
  label,
  value,
  onChange,
  options,
  columns = 3,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string; hint?: string; preview?: React.ReactNode }[];
  columns?: 2 | 3 | 4;
}) {
  const gridClass =
    columns === 4
      ? "sm:grid-cols-4"
      : columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-3";

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className={cn("grid gap-2", gridClass)}>
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-xl border px-3 py-3 text-left transition-colors",
                active
                  ? "border-brand-purple bg-brand-purple/10 ring-1 ring-brand-purple/30"
                  : "border-border bg-background hover:bg-muted/40",
              )}
            >
              {option.preview ? <div className="mb-2">{option.preview}</div> : null}
              <p className={cn("text-sm font-semibold", active ? "text-brand-purple" : "text-foreground")}>
                {option.label}
              </p>
              {option.hint ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{option.hint}</p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SettingsAccentChoice({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string; color: string }[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Accent color</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                active ? "border-brand-purple bg-brand-purple/10 text-brand-purple" : "border-border",
              )}
            >
              <span
                className="h-4 w-4 rounded-full ring-2 ring-white"
                style={{ backgroundColor: option.color }}
              />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ThemePreview({ mode }: { mode: "system" | "light" | "dark" }) {
  const styles =
    mode === "dark"
      ? "border-slate-700 bg-slate-900"
      : mode === "light"
        ? "border-slate-200 bg-white"
        : "border-slate-300 bg-gradient-to-br from-white to-slate-100";

  return (
    <div className={cn("h-10 rounded-lg border p-1.5", styles)}>
      <div className="flex gap-1">
        <div className={cn("h-2 w-2 rounded-full", mode === "dark" ? "bg-slate-600" : "bg-slate-300")} />
        <div className={cn("h-2 flex-1 rounded", mode === "dark" ? "bg-slate-700" : "bg-slate-100")} />
      </div>
      <div className={cn("mt-1 h-3 rounded", mode === "dark" ? "bg-slate-800" : "bg-slate-50")} />
    </div>
  );
}

export function SettingsThemeChoice({
  value,
  onChange,
}: {
  value: "system" | "light" | "dark";
  onChange: (value: "system" | "light" | "dark") => void;
}) {
  const options = [
    { value: "system" as const, label: "System", hint: "Match device", preview: <ThemePreview mode="system" /> },
    { value: "light" as const, label: "Light", hint: "Bright & clean", preview: <ThemePreview mode="light" /> },
    { value: "dark" as const, label: "Dark", hint: "Easy on eyes", preview: <ThemePreview mode="dark" /> },
  ];

  return <SettingsChoiceGroup label="Color mode" value={value} onChange={onChange} options={options} />;
}
