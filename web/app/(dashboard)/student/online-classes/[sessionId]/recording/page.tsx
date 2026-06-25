import { OnlineClassRecording, StudentOnlineClassesLayout } from "@/components/dashboard";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <StudentOnlineClassesLayout standalone>
      <OnlineClassRecording sessionId={sessionId} />
    </StudentOnlineClassesLayout>
  );
}
