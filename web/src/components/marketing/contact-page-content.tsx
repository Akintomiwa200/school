"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { appConfig } from "@/config";
import { AuthField } from "@/components/auth/auth-field";
import { cn } from "@/lib/utils";

const POPULAR_INQUIRIES = [
  {
    title: "Parents & families",
    description: "Enrollment, programs, and support for your child's learning journey.",
    href: "/admissions",
    linkLabel: "visit admissions",
  },
  {
    title: "Students",
    description: "Help with assignments, schedules, and getting the most from the platform.",
    href: "/register",
    linkLabel: "student resources",
  },
  {
    title: "Teachers & staff",
    description: "Careers, onboarding, and day-to-day tools for educators on our platform.",
    href: "mailto:careers@pathwayacademy.com",
    linkLabel: "visit careers",
  },
  {
    title: "Media & press",
    description: "Story ideas, interviews, and official statements from our communications team.",
    href: "mailto:press@pathwayacademy.com",
    linkLabel: "media inquiries",
  },
  {
    title: "Partners & schools",
    description: "Collaborate with us to bring structured learning to more communities.",
    href: "mailto:partners@pathwayacademy.com",
    linkLabel: "partnership info",
  },
  {
    title: "Technical support",
    description: "Login issues, browser help, and troubleshooting for the learning platform.",
    href: "mailto:support@pathwayacademy.com",
    linkLabel: "get support",
  },
] as const;

const TOPIC_ITEMS = [
  {
    id: "admissions",
    title: "admissions",
    content:
      "Learn about requirements, deadlines, and how to apply. Our admissions team guides every family from first inquiry through enrollment.",
  },
  {
    id: "transcripts",
    title: "request transcripts & records",
    content:
      "Current families can request academic records through the family dashboard or by emailing records@pathwayacademy.com with the student name and grade level.",
  },
  {
    id: "billing",
    title: "tuition & billing",
    content:
      "Questions about invoices, payment plans, or refunds? Contact billing@pathwayacademy.com or reach out through your account billing page.",
  },
  {
    id: "homeschool",
    title: "homeschool programs",
    content:
      "We offer flexible homeschool pathways with live instruction, mentor check-ins, and a parent dashboard. Visit admissions to compare program options.",
  },
  {
    id: "financial-aid",
    title: "financial aid & scholarships",
    content:
      "Limited scholarship and aid options may be available each term. Email financialaid@pathwayacademy.com for current eligibility and application windows.",
  },
  {
    id: "platform",
    title: "platform login help",
    content:
      "Reset your password from the login page or email support@pathwayacademy.com if you cannot access your account after registering.",
  },
  {
    id: "classes",
    title: "live classes & schedules",
    content:
      "Timetables appear in the student dashboard once enrollment is confirmed. Contact your assigned mentor for schedule changes or absences.",
  },
  {
    id: "privacy",
    title: "privacy & data requests",
    content:
      "To request a copy of personal data or ask about our privacy practices, email privacy@pathwayacademy.com. We respond within applicable legal timeframes.",
  },
] as const;

function ContactLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const isExternal = href.startsWith("mailto:") || href.startsWith("http");

  const classes = cn(
    "inline-flex items-center gap-0.5 font-medium text-brand-purple transition-colors hover:text-brand-purple/80",
    className,
  );

  if (isExternal) {
    return (
      <a href={href} className={classes}>
        {children}
        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
    </Link>
  );
}

function TopicAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-marketing-grid border-y border-marketing-grid">
      {TOPIC_ITEMS.map(({ id, title, content }) => {
        const isOpen = openId === id;

        return (
          <div key={id} className="bg-marketing-surface/60">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-marketing-surface sm:px-6 sm:py-6"
            >
              <span className="font-display text-lg font-bold lowercase text-marketing-text sm:text-xl">
                {title}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center text-marketing-text">
                {isOpen ? (
                  <Minus className="h-5 w-5" strokeWidth={2} aria-hidden />
                ) : (
                  <Plus className="h-5 w-5" strokeWidth={2} aria-hidden />
                )}
              </span>
            </button>
            {isOpen ? (
              <div className="border-t border-marketing-grid/80 bg-marketing-bg px-5 py-5 sm:px-6 sm:py-6">
                <p className="max-w-3xl text-base leading-relaxed text-marketing-muted">{content}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    toast.success("Message sent! We will get back to you within 1–2 business days.");
    e.currentTarget.reset();
    setIsSubmitting(false);
  };

  return (
    <form className="mx-auto mt-10 max-w-xl space-y-4" onSubmit={handleSubmit}>
      <AuthField
        id="contact-name"
        label="Full name"
        type="text"
        variant="desktop"
        required
        disabled={isSubmitting}
      />
      <AuthField
        id="contact-email"
        label="Email"
        type="email"
        variant="desktop"
        required
        disabled={isSubmitting}
      />
      <AuthField
        id="contact-subject"
        label="Subject"
        type="text"
        placeholder="Enrollment, support, partnership…"
        variant="desktop"
        required
        disabled={isSubmitting}
      />
      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-sm font-medium text-brand-purple">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          disabled={isSubmitting}
          className="w-full rounded-md border border-brand-purple/25 bg-marketing-bg px-3 py-2 text-sm text-marketing-text outline-none transition-shadow placeholder:text-marketing-muted/70 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 disabled:opacity-60"
          placeholder="How can we help?"
        />
      </div>
      <button type="submit" disabled={isSubmitting} className="auth-btn-primary w-full sm:w-auto">
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

export function ContactPageContent() {
  return (
    <>
      {/* Hero */}
      <section className="bg-marketing-bg pt-12 pb-10 text-center lg:pt-16 lg:pb-14">
        <div className="container-content max-w-[1400px]">
          <h1 className="font-display text-4xl font-bold lowercase tracking-tight text-brand-purple sm:text-5xl lg:text-[3.5rem]">
            contact us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-marketing-text sm:text-lg">
            we&apos;re a leading platform for structured learning — at school, at home, and
            everywhere families grow together
          </p>
        </div>
      </section>

      {/* Headquarters + global contacts */}
      <section className="bg-marketing-bg pb-12 lg:pb-16">
        <div className="container-content max-w-[1400px]">
          <div className="mx-auto grid max-w-4xl gap-10 text-center sm:grid-cols-2 sm:gap-12 sm:text-left lg:gap-16">
            <div>
              <h2 className="font-display text-xl font-bold lowercase text-marketing-text sm:text-2xl">
                {appConfig.name.toLowerCase()} headquarters
              </h2>
              <address className="mt-4 space-y-1 text-base not-italic leading-relaxed text-marketing-text">
                <p>128 Learning Lane</p>
                <p>Education District</p>
                <p>Lagos, Nigeria</p>
              </address>
              <p className="mt-4">
                <a
                  href="tel:+2348000000000"
                  className="font-medium text-brand-purple transition-colors hover:text-brand-purple/80"
                >
                  +234 (0) 800 000 0000
                </a>
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold lowercase text-marketing-text sm:text-2xl">
                global contacts
              </h2>
              <p className="mt-4 text-base leading-relaxed text-marketing-text">
                connect with our regional teams and online support wherever you are learning.
              </p>
              <p className="mt-4">
                <ContactLink href="/about">visit {appConfig.name.toLowerCase()} worldwide</ContactLink>
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a
              href="mailto:hello@pathwayacademy.com"
              className="inline-flex items-center gap-1 rounded-md bg-brand-purple px-8 py-3.5 text-sm font-semibold lowercase text-white shadow-marketing transition-transform hover:scale-[1.02] sm:text-base"
            >
              email {appConfig.name.toLowerCase()}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* Popular inquiries */}
      <section className="bg-marketing-bg py-14 lg:py-20">
        <div className="container-content max-w-[1400px]">
          <h2 className="text-center font-display text-3xl font-bold lowercase text-marketing-text sm:text-4xl">
            popular inquiries
          </h2>

          <div className="mx-auto mt-12 grid max-w-5xl gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_INQUIRIES.map(({ title, description, href, linkLabel }) => (
              <article key={title}>
                <h3 className="font-display text-lg font-bold lowercase text-marketing-text sm:text-xl">
                  {title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-marketing-text">{description}</p>
                <p className="mt-4">
                  <ContactLink href={href}>visit {linkLabel}</ContactLink>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Important topic accordion */}
      <section className="bg-marketing-bg pb-section lg:pb-24">
        <div className="container-content max-w-[1400px]">
          <h2 className="text-center font-display text-3xl font-bold lowercase text-marketing-text sm:text-4xl">
            important topic information
          </h2>

          <div className="mx-auto mt-12 max-w-4xl">
            <TopicAccordion />
          </div>

          <div id="contact-form" className="mt-16 text-center">
            <h2 className="font-display text-2xl font-bold lowercase text-marketing-text sm:text-3xl">
              send us a message
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-marketing-muted">
              Prefer a form? Tell us how we can help and our team will respond within 1–2 business
              days.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
