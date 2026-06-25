"use client";

import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/shared";
import { useAppearanceStore } from "@/store/appearance.store";
import {
  AccentColorPicker,
  ColorModePicker,
  DensityPicker,
  FontSizePicker,
  SidebarBehaviorPicker,
} from "./appearance-ui";
import {
  MESSAGE_PRIVACY_OPTIONS,
  NUMBER_FORMATS,
  TIME_FORMATS,
  type AccessibilityForm,
  type AppearanceForm,
  type IntegrationService,
  type PrivacyForm,
} from "./settings-data";
import {
  SettingsField,
  SettingsSectionTitle,
  SettingsSelect,
  SettingsToggle,
} from "./settings-ui";

export function AppearanceSection() {
  const { setTheme } = useTheme();
  const appearance = useAppearanceStore((state) => state.appearance);
  const patchAppearance = useAppearanceStore((state) => state.patchAppearance);

  function update<K extends keyof AppearanceForm>(key: K, value: AppearanceForm[K]) {
    patchAppearance(key, value, setTheme);
  }

  return (
    <div className="space-y-5">
      <SettingsSectionTitle
        title="Appearance"
        description="Customize how the portal looks and feels. Changes apply instantly across the entire app."
      />

      <ColorModePicker value={appearance.theme} onChange={(value) => update("theme", value)} />
      <AccentColorPicker value={appearance.accent} onChange={(value) => update("accent", value)} />
      <FontSizePicker value={appearance.fontSize} onChange={(value) => update("fontSize", value)} />
      <DensityPicker value={appearance.density} onChange={(value) => update("density", value)} />
      <SidebarBehaviorPicker
        value={appearance.sidebarStyle}
        onChange={(value) => update("sidebarStyle", value)}
      />
    </div>
  );
}

export function PrivacySection({
  privacy,
  onChange,
  role,
}: {
  privacy: PrivacyForm;
  onChange: (value: PrivacyForm) => void;
  role: UserRole;
}) {
  function update<K extends keyof PrivacyForm>(key: K, value: PrivacyForm[K]) {
    onChange({ ...privacy, [key]: value });
  }

  const isStudent = role === UserRole.STUDENT;
  const isParent = role === UserRole.PARENT;

  return (
    <div className="space-y-6">
      <SettingsSectionTitle
        title="Privacy"
        description="Control who can see your profile and how your data is shared."
      />

      <div className="space-y-3">
        <SettingsToggle
          id="profile-visible"
          label="Public profile"
          description="Allow classmates and staff to view your profile page."
          checked={privacy.profileVisible}
          onChange={(value) => update("profileVisible", value)}
        />
        <SettingsToggle
          id="online-status"
          label="Show online status"
          description="Let others see when you are active in the portal."
          checked={privacy.showOnlineStatus}
          onChange={(value) => update("showOnlineStatus", value)}
        />
        {isStudent ? (
          <SettingsToggle
            id="share-activity"
            label="Share learning activity"
            description="Show course progress on your profile dashboard."
            checked={privacy.shareActivity}
            onChange={(value) => update("shareActivity", value)}
          />
        ) : null}
        <SettingsToggle
          id="show-email"
          label="Show email on profile"
          description="Display your email address to other users."
          checked={privacy.showEmail}
          onChange={(value) => update("showEmail", value)}
        />
        {isParent ? (
          <SettingsToggle
            id="show-grades-parents"
            label="Share grades with linked guardians"
            description="Allow connected parent accounts to view report cards."
            checked={privacy.showGradesToParents}
            onChange={(value) => update("showGradesToParents", value)}
          />
        ) : null}
      </div>

      <SettingsField id="allowMessages" label="Who can message you">
        <SettingsSelect
          id="allowMessages"
          value={privacy.allowMessagesFrom}
          onChange={(value) =>
            update("allowMessagesFrom", value as PrivacyForm["allowMessagesFrom"])
          }
          options={MESSAGE_PRIVACY_OPTIONS}
        />
      </SettingsField>
    </div>
  );
}

export function AccessibilitySection() {
  const accessibility = useAppearanceStore((state) => state.accessibility);
  const patchAccessibility = useAppearanceStore((state) => state.patchAccessibility);

  function update<K extends keyof AccessibilityForm>(key: K, value: AccessibilityForm[K]) {
    patchAccessibility(key, value);
  }

  return (
    <div className="space-y-6">
      <SettingsSectionTitle
        title="Accessibility"
        description="Options to improve readability, navigation, and comfort across the app."
      />

      <div className="space-y-3">
        <SettingsToggle
          id="reduced-motion"
          label="Reduce motion"
          description="Minimize animations and transitions across the portal."
          checked={accessibility.reducedMotion}
          onChange={(value) => update("reducedMotion", value)}
        />
        <SettingsToggle
          id="high-contrast"
          label="High contrast"
          description="Increase contrast between text and backgrounds."
          checked={accessibility.highContrast}
          onChange={(value) => update("highContrast", value)}
        />
        <SettingsToggle
          id="large-targets"
          label="Larger click targets"
          description="Increase button and link tap areas for easier interaction."
          checked={accessibility.largerClickTargets}
          onChange={(value) => update("largerClickTargets", value)}
        />
        <SettingsToggle
          id="screen-reader"
          label="Screen reader optimizations"
          description="Improve labels and landmarks for assistive technology."
          checked={accessibility.screenReaderOptimized}
          onChange={(value) => update("screenReaderOptimized", value)}
        />
        <SettingsToggle
          id="underline-links"
          label="Underline links"
          description="Always underline text links for better visibility."
          checked={accessibility.underlineLinks}
          onChange={(value) => update("underlineLinks", value)}
        />
        <SettingsToggle
          id="focus-indicators"
          label="Enhanced focus indicators"
          description="Show a stronger outline when navigating with keyboard."
          checked={accessibility.focusIndicators}
          onChange={(value) => update("focusIndicators", value)}
        />
      </div>
    </div>
  );
}

export function IntegrationsSection({
  integrations,
  onChange,
}: {
  integrations: IntegrationService[];
  onChange: (value: IntegrationService[]) => void;
}) {
  function toggleConnection(id: string) {
    onChange(
      integrations.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <SettingsSectionTitle
        title="Integrations"
        description="Connect external tools for calendar sync, classes, and meetings."
      />

      <ul className="space-y-3">
        {integrations.map((service) => (
          <li
            key={service.id}
            className="flex flex-col gap-3 rounded-xl border border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
                {service.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{service.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{service.description}</p>
                <span
                  className={
                    service.connected
                      ? "mt-2 inline-flex rounded-full bg-green/15 px-2.5 py-0.5 text-xs font-semibold text-green"
                      : "mt-2 inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
                  }
                >
                  {service.connected ? "Connected" : "Not connected"}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant={service.connected ? "outline" : "default"}
              className={
                service.connected
                  ? "h-10 shrink-0 rounded-full"
                  : "h-10 shrink-0 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
              }
              onClick={() => {
                const connecting = !service.connected;
                toggleConnection(service.id);
                toast.message(
                  connecting ? `${service.name} connected (demo)` : `${service.name} disconnected (demo)`,
                );
              }}
            >
              {service.connected ? "Disconnect" : "Connect"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PreferencesExtraFields({
  timeFormat,
  numberFormat,
  onTimeFormatChange,
  onNumberFormatChange,
}: {
  timeFormat: string;
  numberFormat: string;
  onTimeFormatChange: (value: string) => void;
  onNumberFormatChange: (value: string) => void;
}) {
  return (
    <>
      <SettingsField id="timeFormat" label="Time format">
        <SettingsSelect
          id="timeFormat"
          value={timeFormat}
          onChange={onTimeFormatChange}
          options={TIME_FORMATS}
        />
      </SettingsField>
      <SettingsField id="numberFormat" label="Number format">
        <SettingsSelect
          id="numberFormat"
          value={numberFormat}
          onChange={onNumberFormatChange}
          options={NUMBER_FORMATS.map((item) => ({ value: item.value, label: item.label }))}
        />
      </SettingsField>
    </>
  );
}
