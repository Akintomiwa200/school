import { MarketingFooter } from "./footer";
import { MarketingNavbar } from "./navbar";
import { AdmissionsRealtimeBridge } from "@/components/admissions/admissions-realtime-bridge";
import { ContactRealtimeBridge } from "@/components/contact/contact-realtime-bridge";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-page min-h-screen bg-marketing-bg text-marketing-text">
      <AdmissionsRealtimeBridge />
      <ContactRealtimeBridge />
      <MarketingNavbar />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
