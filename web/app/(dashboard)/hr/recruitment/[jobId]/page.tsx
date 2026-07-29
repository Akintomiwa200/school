import { HrRecruitmentDetail } from "@/components/dashboard/hr/hr-recruitment-detail";

type PageProps = { params: Promise<{ jobId: string }> };

export default async function Page({ params }: PageProps) {
  const { jobId } = await params;
  return <HrRecruitmentDetail jobId={jobId} />;
}
