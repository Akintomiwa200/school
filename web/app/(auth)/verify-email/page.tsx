import { AuthShell } from "@/components/auth/auth-shell";

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Verify Email" subtitle="Email verification page ready for implementation.">
      <p className="auth-body text-center">
        Check your inbox for a verification link, or return to login if you already verified your
        account.
      </p>
    </AuthShell>
  );
}
