import Link from "next/link";
import { MarketingLogo } from "@/components/marketing/logo";

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-50 bg-marketing-bg/95 backdrop-blur-md">
      <div className="container-content flex h-14 items-center sm:h-16">
        <Link href="/" className="inline-flex shrink-0" aria-label="Back to home">
          <MarketingLogo />
        </Link>
      </div>
    </header>
  );
}
