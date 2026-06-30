import { SharedAnnouncementDetail } from "@/components/dashboard";

type PageProps = { params: Promise<{ announcementId: string }> };

export default async function Page({ params }: PageProps) {
  const { announcementId } = await params;
  return (
    <SharedAnnouncementDetail announcementId={announcementId} basePath="/receptionist/announcements" />
  );
}
