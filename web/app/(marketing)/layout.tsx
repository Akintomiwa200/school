import { MarketingLayout } from "@/components/marketing/marketing-layout";

export default function MarketingRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
