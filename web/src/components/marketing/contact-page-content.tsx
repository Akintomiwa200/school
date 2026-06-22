"use client";

import { useState } from "react";
import { Building2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { appConfig } from "@/config";
import { cn } from "@/lib/utils";
import { AboutContactCta } from "./about-contact-cta";

const LOCATIONS = [
  {
    title: "Lagos headquarters",
    lines: ["128 Learning Lane", "Education District", "Lagos, Nigeria"],
    phone: "+234 (0) 800 000 0000",
    email: "hello@pathwayacademy.com",
  },
  {
    title: "Virtual learning hub",
    lines: ["Nationwide online enrollment", "Live classes & parent dashboard", "Support 7 days a week"],
    phone: "+234 (0) 800 000 0000",
    email: "support@pathwayacademy.com",
  },
] as const;

const MAP_EMBED_URL =
  "https://maps.google.com/maps?q=128+Learning+Lane+Lagos+Nigeria&t=&z=14&ie=UTF8&iwloc=&output=embed";

function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#4a1ca8] via-brand-purple to-brand-purple/90 py-16 text-center text-white sm:py-20 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-56 w-56 opacity-40 sm:h-72 sm:w-72"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.45) 2px, transparent 2px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-1/4 h-48 w-48 rounded-full bg-brand-orange/20 blur-3xl"
      />
      <div className="container-content relative">
        <h1 className="font-display text-4xl font-bold uppercase tracking-[0.12em] sm:text-5xl lg:text-[3.5rem]">
          Contact Us
        </h1>
      </div>
    </section>
  );
}

function LocationCard({
  title,
  lines,
  phone,
  email,
}: {
  title: string;
  lines: readonly string[];
  phone: string;
  email: string;
}) {
  return (
    <div className="flex gap-4 sm:gap-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-purple text-white shadow-marketing sm:h-14 sm:w-14">
        <Building2 className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold text-brand-purple sm:text-xl">{title}</h3>
        <address className="mt-2 space-y-0.5 text-sm not-italic leading-relaxed text-marketing-muted sm:text-base">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </address>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 font-medium text-marketing-text transition-colors hover:text-brand-purple"
          >
            <Phone className="h-3.5 w-3.5 text-brand-purple" aria-hidden />
            {phone}
          </a>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1.5 font-medium text-marketing-text transition-colors hover:text-brand-purple"
          >
            <Mail className="h-3.5 w-3.5 text-brand-purple" aria-hidden />
            {email}
          </a>
        </p>
      </div>
    </div>
  );
}

function ContactFormField({
  id,
  label,
  type = "text",
  required,
  disabled,
  multiline,
  className,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  className?: string;
}) {
  const sharedClass =
    "w-full border-0 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-white/40 disabled:opacity-60 sm:text-base";

  return (
    <div className={cn("border-b border-white/25 pb-1 transition-colors focus-within:border-white", className)}>
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-white/70 sm:text-sm">
        {label}
        {required ? <span className="text-brand-orange"> *</span> : null}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={4}
          required={required}
          disabled={disabled}
          className={cn(sharedClass, "resize-none")}
          placeholder={`Your ${label.toLowerCase().replace(/\s*\*$/, "")}`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          disabled={disabled}
          className={sharedClass}
          placeholder={`Your ${label.toLowerCase().replace(/\s*\*$/, "")}`}
        />
      )}
    </div>
  );
}

function ContactFormCard() {
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
    <div className="rounded-[1.75rem] bg-gradient-to-br from-[#4a1ca8] via-brand-purple to-[#6225d1] p-6 shadow-marketing sm:rounded-[2rem] sm:p-8 lg:p-10">
      <h2 className="font-display text-2xl font-bold text-white sm:text-[1.75rem]">Your Details</h2>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          <ContactFormField id="name" label="Name" required disabled={isSubmitting} />
          <ContactFormField
            id="email"
            label="Email Address"
            type="email"
            required
            disabled={isSubmitting}
          />
        </div>
        <ContactFormField id="subject" label="Subject" required disabled={isSubmitting} />
        <ContactFormField
          id="message"
          label="Comments / Questions"
          required
          disabled={isSubmitting}
          multiline
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-8 py-2.5 text-sm font-bold uppercase tracking-wide text-brand-purple transition-transform hover:scale-[1.02] disabled:opacity-60 sm:text-base"
        >
          {isSubmitting ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}

function ContactMapSection() {
  return (
    <section className="bg-marketing-bg pt-4 pb-10 lg:pb-14">
      <div className="container-content">
        <div className="overflow-hidden rounded-2xl border border-marketing-grid bg-marketing-surface shadow-sm lg:rounded-3xl">
          <div className="relative aspect-[16/9] min-h-[300px] w-full sm:min-h-[380px] lg:min-h-[460px]">
            <iframe
              title={`${appConfig.name} location map`}
              src={MAP_EMBED_URL}
              className="absolute inset-0 h-full w-full border-0 grayscale-[20%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="pointer-events-none absolute inset-0 bg-brand-purple/[0.04]" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactPageContent() {
  return (
    <>
      <ContactHero />

      <section className="bg-marketing-bg py-14 lg:py-20">
        <div className="container-content">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16 xl:gap-20">
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-3xl font-bold text-marketing-text sm:text-4xl">
                Get In Touch
              </h2>
              <p className="marketing-lead-sm mt-4 max-w-2xl leading-relaxed">
                Have questions about enrollment, programs, or support? Reach our team by phone,
                email, or the form. We typically respond within one to two business days.
              </p>

              <div className="mt-10 space-y-10 sm:mt-12">
                {LOCATIONS.map((location) => (
                  <LocationCard key={location.title} {...location} />
                ))}
              </div>
            </div>

            <div className="w-full shrink-0 lg:w-[min(100%,28rem)]">
              <ContactFormCard />
            </div>
          </div>
        </div>
      </section>

      <ContactMapSection />
      <AboutContactCta variant="contact" />
    </>
  );
}
