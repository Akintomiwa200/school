import { StudentLibraryOrders, StudentLibraryShell } from "@/components/dashboard";

export default function Page() {
  return (
    <StudentLibraryShell>
      <StudentLibraryOrders />
    </StudentLibraryShell>
  );
}
