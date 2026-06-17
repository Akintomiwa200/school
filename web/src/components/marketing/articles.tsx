import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const ARTICLES = [
  {
    title: "Maximize Learning at Home",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=640&h=440&fit=crop",
    alt: "Student with headphones learning at a desk",
    href: "#article",
  },
  {
    title: "Engage Kids with Home Education",
    image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=640&h=440&fit=crop",
    alt: "Child using a tablet for interactive learning",
    href: "#article",
  },
  {
    title: "Fun and Creative Ways to Homeschool",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=640&h=440&fit=crop",
    alt: "Art supplies and creative materials on a table",
    href: "#article",
  },
] as const;

function ArticleCard({
  title,
  image,
  alt,
  href,
}: {
  title: string;
  image: string;
  alt: string;
  href: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-[2rem] bg-marketing-card p-md sm:p-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <Image src={image} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>

      <div className="mt-lg flex flex-1 flex-col gap-md sm:flex-row sm:items-end sm:justify-between">
        <h3 className="font-display text-xl font-bold leading-snug text-marketing-text sm:max-w-[14rem]">
          {title}
        </h3>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-brand-purple px-lg py-sm type-link-sm font-semibold text-white transition-transform hover:scale-[1.02] sm:self-auto"
        >
          Read Detail
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>
    </article>
  );
}

export function MarketingArticles() {
  return (
    <section id="article" className="bg-marketing-bg py-section lg:py-24">
      <div className="container-content">
        <div className="grid items-end gap-xl lg:grid-cols-2 lg:gap-xxl">
          <div className="min-w-0">
            <span className="section-badge">Tips & Trick</span>

            <h2 className="marketing-section-title mt-md text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem]">
              Practical Strategies to Make{" "}
              <span className="squiggle-underline">Learning Fun</span> and Effective
            </h2>
          </div>

          <p className="marketing-lead min-w-[16rem] lg:max-w-md lg:justify-self-end lg:pb-2 lg:text-left">
            Boost your homeschooling with expert tips and tricks to stay organized and keep learning
            fun and effective.
          </p>
        </div>

        <div className="mt-section grid gap-xl md:grid-cols-2 lg:mt-xxl lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <ArticleCard key={article.title} {...article} />
          ))}
        </div>
      </div>
    </section>
  );
}
