import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { UserRole } from "@/shared";
import { SharedProfile } from "@/components/dashboard";

export default async function Page() {
  const session = await getSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;

  if (role === UserRole.STUDENT) {
    redirect("/student/profile");
  }

  return <SharedProfile />;
}
