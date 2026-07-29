import Link from "next/link";
import { CheckCircle2, ClipboardList, FileText, UserPlus } from "lucide-react";
import {
  buildAdmissionsPublicSteps,
  buildAdmissionsRequirements,
  formatAdmissionFee,
  SCHOOL_TYPE_LABELS,
  type AdmissionConfig,
} from "@/components/admissions/admissions-workflow-data";
import { MarketingCta } from "./cta";
import { MarketingPageHero } from "./page-hero";

const STEP_ICONS = [UserPlus, FileText, ClipboardList, CheckCircle2] as const;

export function AdmissionsPageContent({ config }: { config: AdmissionConfig }) {
  const steps = buildAdmissionsPublicSteps(config);
  const requirements = buildAdmissionsRequirements(config);
  const typeBadge = SCHOOL_TYPE_LABELS[config.schoolType];

  return (
    <>
      <MarketingPageHero
        badge="Admissions"
        title={config.publicHeroTitle}
        description={config.publicHeroDescription}
      />

      <section className="py-section lg:py-24">
        <div className="container-content">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-badge">{typeBadge}</span>
            <h2 className="marketing-section-title mt-md text-2xl sm:text-3xl">
              Four simple steps to enroll
            </h2>
            <p className="mt-md text-sm text-marketing-muted">
              Application fee: <span className="font-semibold text-marketing-text">{formatAdmissionFee(config.applicationFee)}</span>
              {!config.applicationOpen ? (
                <span className="ml-2 rounded-full bg-brand-orange/15 px-2 py-0.5 text-xs font-semibold text-brand-orange">
                  Applications closed
                </span>
              ) : null}
            </p>
          </div>

          <ol className="mt-section grid gap-lg md:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ title, description }, index) => {
              const Icon = STEP_ICONS[index] ?? UserPlus;
              return (
                <li
                  key={title}
                  className="relative rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-lg"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                    Step {index + 1}
                  </span>
                  <div className="mt-md flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-md font-display text-lg font-bold">{title}</h3>
                  <p className="mt-sm text-sm leading-relaxed text-marketing-muted">{description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="bg-marketing-surface py-section lg:py-24">
        <div className="container-content grid gap-xl lg:grid-cols-2">
          <div>
            <span className="section-badge">Requirements</span>
            <h2 className="marketing-section-title mt-md text-2xl sm:text-3xl">
              What you will need to apply
            </h2>
            <p className="marketing-lead-sm mt-md">{config.welcomeMessage}</p>
            <ul className="mt-lg space-y-3">
              {requirements.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-marketing-text">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-marketing-grid/80 bg-marketing-bg p-lg lg:p-xl">
            <h3 className="font-display text-xl font-bold">Important dates</h3>
            <dl className="mt-lg space-y-4">
              <div className="flex justify-between gap-md border-b border-marketing-grid pb-4">
                <dt className="text-sm text-marketing-muted">{config.schoolName} applications</dt>
                <dd className="text-sm font-semibold text-marketing-text">
                  {config.applicationOpen ? config.intakeStatusNote : "Closed"}
                </dd>
              </div>
              <div className="flex justify-between gap-md border-b border-marketing-grid pb-4">
                <dt className="text-sm text-marketing-muted">Application fee</dt>
                <dd className="text-sm font-semibold text-marketing-text">{formatAdmissionFee(config.applicationFee)}</dd>
              </div>
              <div className="flex justify-between gap-md border-b border-marketing-grid pb-4">
                <dt className="text-sm text-marketing-muted">Exam duration</dt>
                <dd className="text-sm font-semibold text-marketing-text">{config.examDurationMinutes} minutes</dd>
              </div>
              <div className="flex justify-between gap-md">
                <dt className="text-sm text-marketing-muted">Response time</dt>
                <dd className="text-sm font-semibold text-marketing-text">{config.responseTimeNote}</dd>
              </div>
            </dl>

            <div className="mt-xl flex flex-col gap-sm sm:flex-row">
              {config.applicationOpen ? (
                <Link href="/admissions/apply" className="auth-btn-primary text-center">
                  Apply online
                </Link>
              ) : (
                <span className="auth-btn-primary pointer-events-none text-center opacity-60">Applications closed</span>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-brand-purple px-xl py-3 text-sm font-semibold text-brand-purple transition-colors hover:bg-brand-purple/5"
              >
                Ask admissions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingCta />
    </>
  );
}
