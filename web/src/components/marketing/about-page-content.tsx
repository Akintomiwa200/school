import Image from "next/image";
import { BookOpen, Heart, Shield, Users } from "lucide-react";
import { appConfig } from "@/config";
import { ABOUT_HIGHLIGHT_IMAGES, ABOUT_IMAGES } from "./about-images";
import { AboutContactCta } from "./about-contact-cta";

const VALUES = [
  {
    icon: BookOpen,
    title: "Learning first",
    description:
      "Every program is designed around student progress, curiosity, and confidence.",
  },
  {
    icon: Users,
    title: "Families & teachers together",
    description:
      "Parents stay informed, teachers stay connected, and students always feel supported.",
  },
  {
    icon: Shield,
    title: "Safe & structured",
    description:
      "Clear schedules, secure accounts, and transparent communication every step of the way.",
  },
  {
    icon: Heart,
    title: "Whole-child care",
    description:
      "We support academics alongside attendance, wellbeing, and the rhythm of school life.",
  },
] as const;

const PRINCIPALS = [
  {
    name: "Sarah Okonkwo",
    role: "Founder & Principal",
    image: ABOUT_IMAGES.principalSarah,
  },
  {
    name: "David Mensah",
    role: "Founder & Principal",
    image: ABOUT_IMAGES.principalDavid,
  },
] as const;

const HIGHLIGHT_IMAGES = ABOUT_HIGHLIGHT_IMAGES;

const PROGRAMS = [
  {
    title: "Personalized learning paths",
    description:
      "We build schedules and goals around each student's pace, strengths, and interests so progress feels natural and sustainable.",
  },
  {
    title: "Live & guided instruction",
    description:
      "From live classes to mentor check-ins, learners get expert support at every step — at home or in the classroom.",
  },
  {
    title: "Family dashboard",
    description:
      "Parents and guardians stay connected with attendance, assignments, and progress in one clear, secure place.",
  },
  {
    title: "Admissions & onboarding",
    description:
      "Our team guides families from first inquiry through enrollment, so getting started is simple and stress-free.",
  },
] as const;

function AboutIntroSection() {
  return (
    <section className="bg-marketing-bg py-14 lg:py-24">
      <div className="container-content max-w-[1400px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)_minmax(0,1.15fr)] lg:items-start xl:gap-14">
          <div className="flex w-full flex-col justify-start pt-2">
            <h1 className="font-display text-5xl font-black uppercase leading-[0.88] tracking-tight text-marketing-text sm:text-6xl lg:text-[4.5rem] xl:text-[5.5rem]">
              About
              <br />
              Us
            </h1>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-purple">
              Modern learning &amp; family-centered education
            </p>
            <p className="mt-6 text-sm leading-relaxed text-marketing-muted lg:text-base">
              Thoughtful programs featuring clear structure, caring mentors, and tools that keep
              every student engaged — at home or in the classroom.
            </p>
          </div>

          <div className="w-full">
            <div className="relative aspect-[5/4] w-full min-h-[240px] overflow-hidden rounded-[1.75rem] sm:min-h-[320px] lg:min-h-[420px]">
              <Image
                src={ABOUT_IMAGES.heroClassroom}
                alt="Students learning together in a bright modern classroom"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
              />
            </div>
          </div>

          <div className="flex w-full flex-col">
            <div className="relative aspect-[4/3] w-full min-h-[200px] overflow-hidden rounded-[1.5rem] sm:min-h-[260px]">
              <Image
                src={ABOUT_IMAGES.teacherStudent}
                alt="Teacher supporting a student during a lesson"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 32vw"
              />
            </div>
            <h2 className="mt-8 font-display text-xl font-bold text-marketing-text sm:text-2xl">
              Our philosophy
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-marketing-muted lg:text-base">
              At {appConfig.name}, we believe education should feel personal, purposeful, and
              connected. We blend caring mentorship with smart technology so learners grow with
              confidence — and families always know how to help.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MeetPrincipalsSection() {
  return (
    <section className="bg-marketing-bg pb-14 lg:pb-24">
      <div className="container-content max-w-[1400px]">
        <div className="rounded-[2rem] bg-marketing-surface px-6 py-12 sm:px-10 sm:py-14 lg:rounded-[2.5rem] lg:px-14 lg:py-20 xl:px-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-10 xl:gap-14">
            <div className="flex w-full flex-col items-center lg:items-start">
              <div className="relative aspect-[3/4] w-full min-h-[280px] max-w-[320px] overflow-hidden sm:min-h-[320px] lg:max-w-none lg:min-h-[360px]">
                <Image
                  src={PRINCIPALS[0].image}
                  alt={PRINCIPALS[0].name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 360px, 22vw"
                />
              </div>
              <p className="mt-5 font-display text-lg font-bold text-marketing-text sm:text-xl">
                {PRINCIPALS[0].name}
              </p>
              <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-purple sm:text-xs">
                {PRINCIPALS[0].role}
              </p>
            </div>

            <div className="flex w-full flex-col items-center text-center">
              <h2 className="font-display text-3xl font-black uppercase leading-[0.9] tracking-tight text-marketing-text sm:text-4xl lg:text-[2.75rem] xl:text-5xl">
                Meet the
                <br />
                Principals
              </h2>

              <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4">
                {HIGHLIGHT_IMAGES.map((src, index) => (
                  <div
                    key={src}
                    className="relative h-14 w-[5.5rem] shrink-0 overflow-hidden rounded-full sm:h-20 sm:w-[7.5rem]"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="120px"
                      aria-hidden={index > 0}
                    />
                  </div>
                ))}
              </div>

              <p className="mt-8 text-sm leading-relaxed text-marketing-muted sm:text-base">
                Our leadership team brings decades of experience in education, curriculum design,
                and family support. Together they guide {appConfig.name} with a shared commitment to
                excellence, empathy, and innovation in every program we offer.
              </p>
            </div>

            <div className="flex w-full flex-col items-center lg:items-end">
              <div className="relative aspect-[3/4] w-full min-h-[280px] max-w-[320px] overflow-hidden sm:min-h-[320px] lg:max-w-none lg:min-h-[360px]">
                <Image
                  src={PRINCIPALS[1].image}
                  alt={PRINCIPALS[1].name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 360px, 22vw"
                />
              </div>
              <p className="mt-5 font-display text-lg font-bold text-marketing-text sm:text-xl lg:text-right">
                {PRINCIPALS[1].name}
              </p>
              <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-orange sm:text-xs lg:text-right">
                {PRINCIPALS[1].role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OurProgramsSection() {
  return (
    <section className="bg-marketing-bg py-16 lg:py-24">
      <div className="container-content max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-14 xl:gap-16">
          {/* Left — heading, intro, image */}
          <div className="flex w-full flex-col">
            <h2 className="font-display text-4xl font-black uppercase leading-[0.9] tracking-tight text-marketing-text sm:text-5xl lg:text-[4rem]">
              Our
              <br />
              Programs
            </h2>
            <p className="marketing-lead mt-6 w-full text-pretty">
              At {appConfig.name}, we offer a full range of learning support — from enrollment to
              daily instruction — tailored to each family&apos;s needs.
            </p>
            <div className="relative mt-10 aspect-[4/3] w-full min-h-[220px] overflow-hidden rounded-[1.5rem] sm:min-h-[280px] sm:rounded-[2rem] lg:mt-12">
              <Image
                src={ABOUT_IMAGES.studentsCollaborating}
                alt="Students collaborating on a project"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Right — program list */}
          <div className="flex w-full flex-col justify-center divide-y divide-marketing-grid lg:pt-2">
            {PROGRAMS.map(({ title, description }) => (
              <div key={title} className="py-8 first:pt-0 last:pb-0">
                <h3 className="font-display text-lg font-black uppercase tracking-tight text-marketing-text sm:text-xl">
                  {title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-marketing-muted">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="bg-marketing-surface py-16 lg:py-24">
      <div className="container-content max-w-[1400px]">
        <div className="text-center">
          <span className="section-badge">Our values</span>
          <h2 className="marketing-section-title mt-md text-3xl sm:text-4xl">
            What guides everything we build
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-marketing-grid bg-marketing-bg p-7"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-marketing-text">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-marketing-muted sm:text-base">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutPageContent() {
  return (
    <>
      <AboutIntroSection />
      <MeetPrincipalsSection />
      <OurProgramsSection />
      <ValuesSection />
      <AboutContactCta />
    </>
  );
}
