import { HrEmployeeDetail } from "@/components/dashboard/hr/hr-employee-detail";

type PageProps = { params: Promise<{ employeeId: string }> };

export default async function Page({ params }: PageProps) {
  const { employeeId } = await params;
  return <HrEmployeeDetail employeeId={employeeId} />;
}
