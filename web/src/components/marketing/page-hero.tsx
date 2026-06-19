import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarketingPageHeroProps = {
  badge?: string;
  title: ReactNode;
  description?: string;
  className?: string;
};

export function MarketingPageHero({ badge, title, description, className }: MarketingPageHeroProps) {
  return (
    <section
      className={cn(
        "marketing-grid-bg border-b border-marketing-grid/80 bg-marketing-bg py-12 lg:py-16",
        className,
      )}
    >
      <div className="container-content max-w-3xl">
        {badge ? <span className="section-badge">{badge}</span> : null}
        <h1 className="marketing-section-title mt-md text-[2rem] sm:text-[2.75rem] lg:text-[3rem]">
          {title}
        </h1>
        {description ? (
          <p className="marketing-lead mt-md max-w-2xl">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
