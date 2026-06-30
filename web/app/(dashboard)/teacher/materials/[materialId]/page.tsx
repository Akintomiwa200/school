import { TeacherMaterialDetail } from "@/components/dashboard/teacher/teacher-material-detail";

type PageProps = { params: Promise<{ materialId: string }> };

export default async function Page({ params }: PageProps) {
  const { materialId } = await params;
  return <TeacherMaterialDetail materialId={materialId} />;
}
