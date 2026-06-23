import { AuthHeader } from "@/components/auth/auth-header";

export default function StaffAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="staff-auth-page auth-page min-h-screen w-full">
      <AuthHeader />
      {children}
    </div>
  );
}
