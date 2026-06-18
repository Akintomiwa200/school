import { AuthHeader } from "@/components/auth/auth-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page min-h-screen w-full">
      <AuthHeader />
      {children}
    </div>
  );
}
