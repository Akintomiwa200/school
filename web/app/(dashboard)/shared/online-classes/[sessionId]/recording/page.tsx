import { OnlineClassRecording } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;
  return <OnlineClassRecording sessionId={sessionId} />;
}
