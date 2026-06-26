import Link from "next/link";
import { CheckCircle2, ClipboardList, FileText, UserPlus } from "lucide-react";
import { MarketingCta } from "./cta";
import { MarketingPageHero } from "./page-hero";

const STEPS = [
  {
    icon: UserPlus,
    title: "Choose your intake",
    description: "Select secondary school (Grades 6–12) or university undergraduate program.",
  },
  {
    icon: FileText,
    title: "Submit application",
    description: "Complete the online form with contact details and program or grade choice.",
  },
  {
    icon: ClipboardList,
    title: "Pay fee & sit exam",
    description: "Pay the application fee, receive your exam slip, and attend the entrance test.",
  },
  {
    icon: CheckCircle2,
    title: "Approval & enrollment",
    description: "After approval, admissions adds you as a student and shares login credentials.",
  },
] as const;

const REQUIREMENTS = [
  "Completed online application form",
  "Copy of student birth certificate or passport",
  "Last two academic report cards (if transferring)",
  "Parent or guardian valid ID",
  "Passport photograph (digital upload)",
  "Medical information form (provided after application)",
] as const;

export function AdmissionsPageContent() {
  return (
    <>
      <MarketingPageHero
        badge="Admissions"
        title="Start your journey with Pathway Academy"
        description="Our admissions process is straightforward and supportive. We guide every family from first inquiry to first day of class."
      />

      <section className="py-section lg:py-24">
        <div className="container-content">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-badge">How it works</span>
            <h2 className="marketing-section-title mt-md text-2xl sm:text-3xl">
              Four simple steps to enroll
            </h2>
          </div>

          <ol className="mt-section grid gap-lg md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, description }, index) => (
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
            ))}
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
            <p className="marketing-lead-sm mt-md">
              Gather these documents before you begin. Our team can help if you are missing
              anything.
            </p>
            <ul className="mt-lg space-y-3">
              {REQUIREMENTS.map((item) => (
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
                <dt className="text-sm text-marketing-muted">Fall term applications</dt>
                <dd className="text-sm font-semibold text-marketing-text">Open year-round</dd>
              </div>
              <div className="flex justify-between gap-md border-b border-marketing-grid pb-4">
                <dt className="text-sm text-marketing-muted">Spring term deadline</dt>
                <dd className="text-sm font-semibold text-marketing-text">January 15</dd>
              </div>
              <div className="flex justify-between gap-md border-b border-marketing-grid pb-4">
                <dt className="text-sm text-marketing-muted">Summer program</dt>
                <dd className="text-sm font-semibold text-marketing-text">May 1</dd>
              </div>
              <div className="flex justify-between gap-md">
                <dt className="text-sm text-marketing-muted">Response time</dt>
                <dd className="text-sm font-semibold text-marketing-text">5–7 business days</dd>
              </div>
            </dl>

            <div className="mt-xl flex flex-col gap-sm sm:flex-row">
              <Link href="/admissions/apply" className="auth-btn-primary text-center">
                Apply online
              </Link>
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
