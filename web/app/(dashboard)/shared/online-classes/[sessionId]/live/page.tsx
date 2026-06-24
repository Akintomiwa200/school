import { OnlineClassLiveRoom } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;
  return <OnlineClassLiveRoom sessionId={sessionId} />;
}
