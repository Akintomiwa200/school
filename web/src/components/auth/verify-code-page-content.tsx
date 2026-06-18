"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authService } from "@/services";
import { AuthShell } from "./auth-shell";
import { completeAuthSignIn } from "./complete-auth-sign-in";
import { OtpInput } from "./otp-input";

export function VerifyCodePageContent() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [flow, setFlow] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    authService
      .getVerifyCodeContext()
      .then((res) => {
        if (res.data) {
          setEmail(res.data.email);
          setMaskedEmail(res.data.maskedEmail);
          setFlow(res.data.flow);
        }
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await authService.verifyCode({ code });
      const data = res.data;
      if (!data) throw new Error("Verification failed");

      await completeAuthSignIn(data.email, data.otpSessionToken);
      toast.success("Verified successfully");
      router.push(`/auth/success?flow=${data.flow}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid or expired code";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await authService.resendCode();
      if (res.data?.devCode) {
        toast.message(`Dev code: ${res.data.devCode}`);
      } else {
        toast.success("New code sent");
      }
    } catch {
      toast.error("Could not resend code");
    }
  };

  if (loading) {
    return (
      <AuthShell title="Verify code" subtitle="Loading your verification session…">
        <p className="auth-body text-center">Please wait…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Enter verification code"
      subtitle={`We sent a 6-digit code to ${maskedEmail || email}. Enter it below to continue.`}
    >
      <div className="space-y-6">
        <OtpInput value={code} onChange={setCode} disabled={submitting} error={error} />

        <button
          type="button"
          onClick={handleVerify}
          disabled={submitting || code.length !== 6}
          className="auth-btn-primary"
        >
          {submitting ? "Verifying…" : flow === "signup" ? "Verify & continue" : "Verify & sign in"}
        </button>

        <p className="auth-muted text-center">
          Didn&apos;t get the code?{" "}
          <button type="button" onClick={handleResend} className="auth-link">
            Resend
          </button>
        </p>

        <p className="auth-muted text-center">
          <Link href="/login" className="auth-link">
            Back to login
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
