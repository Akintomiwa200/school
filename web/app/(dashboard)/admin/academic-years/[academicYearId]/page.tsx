import { AdminAcademicYearDetail } from "@/components/dashboard/admin/admin-academic-year-detail";

type PageProps = {
  params: Promise<{ academicYearId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { academicYearId } = await params;
  return <AdminAcademicYearDetail academicYearId={academicYearId} />;
}
