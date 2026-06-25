"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Trash2,
  Upload,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/shared";
import { DEMO_SESSIONS } from "../profile/profile-data";
import { formatRoleLabel, getProfileInitials } from "../profile/profile-ui";
import {
  AccessibilitySection,
  AppearanceSection,
  IntegrationsSection,
  PreferencesExtraFields,
  PrivacySection,
} from "./settings-extra-sections";
import {
  COUNTRIES,
  DATE_FORMATS,
  DEMO_LINKED_ACCOUNTS,
  DEMO_PAYMENT_METHODS,
  LANGUAGES,
  TIMEZONES,
  WEEK_STARTS,
  getDefaultGeneralForm,
  getDefaultIntegrations,
  getDefaultNotificationPrefs,
  getDefaultPreferences,
  getDefaultPrivacy,
  getSettingsTabsForRole,
  isValidSettingsTabId,
  type GeneralSettingsForm,
  type IntegrationService,
  type NotificationPrefs,
  type PreferencesForm,
  type PrivacyForm,
  type SettingsTabId,
} from "./settings-data";
import {
  SettingsField,
  SettingsInput,
  SettingsNavItem,
  SettingsPanel,
  SettingsSectionTitle,
  SettingsSelect,
  SettingsToggle,
} from "./settings-ui";

function useSettingsTab(): [SettingsTabId, (tab: SettingsTabId) => void] {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (isValidSettingsTabId(hash)) setActiveTab(hash);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const setTab = (tab: SettingsTabId) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  return [activeTab, setTab];
}

export function SharedSettings() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;
  const tabs = useMemo(() => getSettingsTabsForRole(role), [role]);
  const [activeTab, setActiveTab] = useSettingsTab();
  const [saving, setSaving] = useState(false);

  const displayName = (session?.user?.name ?? "Alex Johnson").trim();
  const roleLabel = formatRoleLabel(role);
  const initials = getProfileInitials(session?.user?.name);

  const [general, setGeneral] = useState<GeneralSettingsForm>(() => getDefaultGeneralForm(role));
  const [preferences, setPreferences] = useState<PreferencesForm>(getDefaultPreferences);
  const [privacy, setPrivacy] = useState<PrivacyForm>(() => getDefaultPrivacy(role));
  const [notifications, setNotifications] = useState<NotificationPrefs>(getDefaultNotificationPrefs);
  const [integrations, setIntegrations] = useState<IntegrationService[]>(getDefaultIntegrations);
  const [twoFactor, setTwoFactor] = useState(false);

  const [initialSnapshot, setInitialSnapshot] = useState(() =>
    JSON.stringify({
      general: getDefaultGeneralForm(role),
      preferences: getDefaultPreferences(),
      privacy: getDefaultPrivacy(role),
      notifications: getDefaultNotificationPrefs(),
      integrations: getDefaultIntegrations(),
      twoFactor: false,
    }),
  );

  useEffect(() => {
    const form = getDefaultGeneralForm(role);
    setGeneral(form);
    setPrivacy(getDefaultPrivacy(role));
    setInitialSnapshot(
      JSON.stringify({
        general: form,
        preferences: getDefaultPreferences(),
        privacy: getDefaultPrivacy(role),
        notifications: getDefaultNotificationPrefs(),
        integrations: getDefaultIntegrations(),
        twoFactor: false,
      }),
    );
  }, [role]);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id ?? "general");
    }
  }, [tabs, activeTab, setActiveTab]);

  useEffect(() => {
    if (session?.user?.email) {
      setGeneral((prev) => ({ ...prev, email: session.user?.email ?? prev.email }));
    }
  }, [session?.user?.email]);

  const isDirty =
    JSON.stringify({
      general,
      preferences,
      privacy,
      notifications,
      integrations,
      twoFactor,
    }) !== initialSnapshot;

  async function handleSave() {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setInitialSnapshot(
      JSON.stringify({
        general,
        preferences,
        privacy,
        notifications,
        integrations,
        twoFactor,
      }),
    );
    setSaving(false);
    toast.success("Settings saved");
  }

  function handleCancel() {
    if (isDirty && !window.confirm("Discard unsaved changes?")) return;
    router.back();
  }

  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Manage your profile, appearance, privacy, security, and notification preferences.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full px-5"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
            disabled={saving || !isDirty}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <SettingsPanel className="h-fit border border-border p-3 lg:sticky lg:top-24">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <SettingsNavItem
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </nav>
        </SettingsPanel>

        <SettingsPanel className="min-w-0 border border-border p-5 sm:p-6">
          {activeTab === "general" ? (
            <GeneralSection
              displayName={displayName}
              roleLabel={roleLabel}
              initials={initials}
              image={session?.user?.image}
              general={general}
              onChange={setGeneral}
            />
          ) : null}

          {activeTab === "appearance" ? <AppearanceSection /> : null}

          {activeTab === "preferences" ? (
            <PreferencesSection preferences={preferences} onChange={setPreferences} />
          ) : null}

          {activeTab === "privacy" ? (
            <PrivacySection privacy={privacy} onChange={setPrivacy} role={role} />
          ) : null}

          {activeTab === "accessibility" ? <AccessibilitySection /> : null}

          {activeTab === "security" ? (
            <SecuritySection twoFactor={twoFactor} onTwoFactorChange={setTwoFactor} />
          ) : null}

          {activeTab === "notifications" ? (
            <NotificationsSection notifications={notifications} onChange={setNotifications} />
          ) : null}

          {activeTab === "integrations" ? (
            <IntegrationsSection integrations={integrations} onChange={setIntegrations} />
          ) : null}

          {activeTab === "account" ? (
            <AccountSection displayName={displayName} role={role} email={general.email} />
          ) : null}

          {activeTab === "account-manager" ? <AccountManagerSection role={role} /> : null}

          {activeTab === "billing" ? <BillingSection /> : null}

          {!tabs.some((tab) => tab.id === activeTab) && activeTabMeta ? (
            <SettingsSectionTitle
              title={activeTabMeta.label}
              description={activeTabMeta.description}
            />
          ) : null}
        </SettingsPanel>
      </div>
    </div>
  );
}

function GeneralSection({
  displayName,
  roleLabel,
  initials,
  image,
  general,
  onChange,
}: {
  displayName: string;
  roleLabel: string;
  initials: string;
  image?: string | null;
  general: GeneralSettingsForm;
  onChange: (value: GeneralSettingsForm) => void;
}) {
  function update<K extends keyof GeneralSettingsForm>(key: K, value: GeneralSettingsForm[K]) {
    onChange({ ...general, [key]: value });
  }

  return (
    <div className="space-y-8">
      <SettingsSectionTitle
        title="General Information"
        description="Update your photo and contact details used across the school portal."
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted ring-4 ring-background">
            {image ? (
              <Image src={image} alt={displayName} fill className="object-cover" sizes="80px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">
                {initials}
              </span>
            )}
            <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground">
              <Lock className="h-3 w-3" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">{displayName}</p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{roleLabel}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {general.city}, {general.country}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            className="h-10 rounded-full bg-brand-purple px-4 text-white hover:bg-brand-purple/90"
            onClick={() => toast.message("Photo upload will be available soon.")}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload New Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full px-4"
            onClick={() => toast.message("Photo removed (demo)")}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Organization Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField id="businessName" label="School / Organization">
            <SettingsInput
              id="businessName"
              value={general.businessName}
              onChange={(value) => update("businessName", value)}
            />
          </SettingsField>
          <SettingsField id="email" label="Email Address">
            <SettingsInput
              id="email"
              type="email"
              value={general.email}
              onChange={(value) => update("email", value)}
            />
          </SettingsField>
          <SettingsField id="phone" label="Phone Number">
            <SettingsInput
              id="phone"
              type="tel"
              value={general.phone}
              onChange={(value) => update("phone", value)}
            />
          </SettingsField>
          <SettingsField id="fax" label="Fax">
            <SettingsInput
              id="fax"
              value={general.fax}
              placeholder="Optional"
              onChange={(value) => update("fax", value)}
            />
          </SettingsField>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Address</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField id="country" label="Country">
            <SettingsSelect
              id="country"
              value={general.country}
              onChange={(value) => update("country", value)}
              options={COUNTRIES.map((country) => ({ value: country, label: country }))}
            />
          </SettingsField>
          <SettingsField id="city" label="City">
            <SettingsInput id="city" value={general.city} onChange={(value) => update("city", value)} />
          </SettingsField>
          <SettingsField id="postcode" label="Postcode">
            <SettingsInput
              id="postcode"
              value={general.postcode}
              onChange={(value) => update("postcode", value)}
            />
          </SettingsField>
          <SettingsField id="state" label="State">
            <SettingsInput id="state" value={general.state} onChange={(value) => update("state", value)} />
          </SettingsField>
        </div>
      </div>
    </div>
  );
}

function PreferencesSection({
  preferences,
  onChange,
}: {
  preferences: PreferencesForm;
  onChange: (value: PreferencesForm) => void;
}) {
  function update<K extends keyof PreferencesForm>(key: K, value: PreferencesForm[K]) {
    onChange({ ...preferences, [key]: value });
  }

  return (
    <div className="space-y-6">
      <SettingsSectionTitle
        title="Preferences"
        description="Customize language, timezone, and regional formats."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField id="language" label="Language">
          <SettingsSelect
            id="language"
            value={preferences.language}
            onChange={(value) => update("language", value)}
            options={LANGUAGES}
          />
        </SettingsField>
        <SettingsField id="timezone" label="Timezone">
          <SettingsSelect
            id="timezone"
            value={preferences.timezone}
            onChange={(value) => update("timezone", value)}
            options={TIMEZONES}
          />
        </SettingsField>
        <SettingsField id="dateFormat" label="Date format">
          <SettingsSelect
            id="dateFormat"
            value={preferences.dateFormat}
            onChange={(value) => update("dateFormat", value)}
            options={DATE_FORMATS}
          />
        </SettingsField>
        <SettingsField id="weekStart" label="Week starts on">
          <SettingsSelect
            id="weekStart"
            value={preferences.weekStart}
            onChange={(value) => update("weekStart", value)}
            options={WEEK_STARTS}
          />
        </SettingsField>
        <PreferencesExtraFields
          timeFormat={preferences.timeFormat}
          numberFormat={preferences.numberFormat}
          onTimeFormatChange={(value) => update("timeFormat", value as PreferencesForm["timeFormat"])}
          onNumberFormatChange={(value) => update("numberFormat", value)}
        />
      </div>
    </div>
  );
}

function SecuritySection({
  twoFactor,
  onTwoFactorChange,
}: {
  twoFactor: boolean;
  onTwoFactorChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingsSectionTitle
        title="Security"
        description="Protect your account with a strong password and active session control."
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium">Password</p>
          <p className="mt-1 text-sm text-muted-foreground">Last changed 3 months ago</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full shrink-0 rounded-full px-4 sm:w-auto"
          onClick={() => toast.message("Password change flow will open here.")}
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Change password
        </Button>
      </div>

      <SettingsToggle
        id="two-factor"
        label="Two-factor authentication"
        description="Require a verification code when signing in on a new device."
        checked={twoFactor}
        onChange={onTwoFactorChange}
      />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Active sessions</h3>
        <ul className="space-y-2">
          {DEMO_SESSIONS.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.device}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.location} · {item.lastActive}
                </p>
              </div>
              {item.current ? (
                <span className="inline-flex shrink-0 rounded-full bg-green/15 px-2.5 py-1 text-xs font-semibold text-green">
                  This device
                </span>
              ) : (
                <button
                  type="button"
                  className="text-xs font-medium text-destructive hover:underline"
                  onClick={() => toast.message("Session revoked (demo)")}
                >
                  Sign out
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function NotificationsSection({
  notifications,
  onChange,
}: {
  notifications: NotificationPrefs;
  onChange: (value: NotificationPrefs) => void;
}) {
  function update<K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) {
    onChange({ ...notifications, [key]: value });
  }

  return (
    <div className="space-y-6">
      <SettingsSectionTitle
        title="Notifications"
        description="Choose how you want to be notified about school activity."
      />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Email notifications</h3>
        <SettingsToggle
          id="email-announcements"
          label="Announcements"
          description="School-wide news and updates."
          checked={notifications.emailAnnouncements}
          onChange={(value) => update("emailAnnouncements", value)}
        />
        <SettingsToggle
          id="email-assignments"
          label="Assignments"
          description="New tasks and due date reminders."
          checked={notifications.emailAssignments}
          onChange={(value) => update("emailAssignments", value)}
        />
        <SettingsToggle
          id="email-grades"
          label="Grades & reports"
          description="Published marks and report cards."
          checked={notifications.emailGrades}
          onChange={(value) => update("emailGrades", value)}
        />
        <SettingsToggle
          id="email-messages"
          label="Messages"
          description="Direct messages from teachers and staff."
          checked={notifications.emailMessages}
          onChange={(value) => update("emailMessages", value)}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">In-app notifications</h3>
        <SettingsToggle
          id="push-announcements"
          label="Announcements"
          checked={notifications.pushAnnouncements}
          onChange={(value) => update("pushAnnouncements", value)}
        />
        <SettingsToggle
          id="push-assignments"
          label="Assignments"
          checked={notifications.pushAssignments}
          onChange={(value) => update("pushAssignments", value)}
        />
        <SettingsToggle
          id="push-grades"
          label="Grades"
          checked={notifications.pushGrades}
          onChange={(value) => update("pushGrades", value)}
        />
        <SettingsToggle
          id="push-messages"
          label="Messages"
          checked={notifications.pushMessages}
          onChange={(value) => update("pushMessages", value)}
        />
        <SettingsToggle
          id="digest-weekly"
          label="Weekly digest"
          description="A summary email every Monday morning."
          checked={notifications.digestWeekly}
          onChange={(value) => update("digestWeekly", value)}
        />
      </div>
    </div>
  );
}

function AccountSection({
  displayName,
  role,
  email,
}: {
  displayName: string;
  role: UserRole;
  email: string;
}) {
  return (
    <div className="space-y-6">
      <SettingsSectionTitle
        title="Account"
        description="View your account type and manage your membership."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Full name</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{displayName}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account type</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{formatRoleLabel(role)}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            {email}
          </p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Member since</p>
          <p className="mt-2 text-sm font-semibold text-foreground">September 2024</p>
        </div>
      </div>

      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm font-semibold text-foreground">Deactivate account</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Temporarily disable your portal access. Contact the school office to fully close your account.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 h-10 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => toast.message("Account deactivation requires admin approval.")}
        >
          Request deactivation
        </Button>
      </div>
    </div>
  );
}

function AccountManagerSection({ role }: { role: UserRole }) {
  const isParent = role === UserRole.PARENT;

  return (
    <div className="space-y-6">
      <SettingsSectionTitle
        title="Account Manager"
        description={
          isParent
            ? "Manage linked student accounts under your guardian profile."
            : "Manage delegated users who can act on behalf of your organization."
        }
      />

      <ul className="space-y-2">
        {DEMO_LINKED_ACCOUNTS.map((account) => (
          <li
            key={account.id}
            className="flex flex-col gap-3 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{account.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{account.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green/15 px-2.5 py-1 text-xs font-semibold text-green">
                {account.status}
              </span>
              <Button type="button" variant="outline" size="sm" className="rounded-full">
                Manage
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
        onClick={() => toast.message("Link account flow will open here.")}
      >
        {isParent ? "Link a child account" : "Invite delegated user"}
      </Button>
    </div>
  );
}

function BillingSection() {
  return (
    <div className="space-y-6">
      <SettingsSectionTitle
        title="Billings"
        description="Saved payment methods and recent billing activity."
      />

      <div className="space-y-2">
        {DEMO_PAYMENT_METHODS.map((method) => (
          <div
            key={method.id}
            className="flex flex-col gap-3 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{method.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Expires {method.expiry}</p>
            </div>
            <div className="flex items-center gap-2">
              {method.default ? (
                <span className="rounded-full bg-brand-purple/15 px-2.5 py-1 text-xs font-semibold text-brand-purple">
                  Default
                </span>
              ) : (
                <button
                  type="button"
                  className="text-xs font-medium text-brand-purple hover:underline"
                  onClick={() => toast.message("Set as default (demo)")}
                >
                  Set default
                </button>
              )}
              <Button type="button" variant="outline" size="sm" className="rounded-full">
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        className="h-10 rounded-full bg-brand-purple px-5 text-white hover:bg-brand-purple/90"
        onClick={() => toast.message("Add payment method flow will open here.")}
      >
        Add payment method
      </Button>
    </div>
  );
}
