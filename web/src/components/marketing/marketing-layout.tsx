import { MarketingFooter } from "./footer";
import { MarketingNavbar } from "./navbar";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-page min-h-screen bg-marketing-bg text-marketing-text">
      <MarketingNavbar />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
