"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { appConfig } from "@/config";
import { authService } from "@/services";
import { resetPasswordSchema, type ResetPasswordInput } from "@/shared";
import { AuthField } from "./auth-field";
import { AuthPageLayout } from "./auth-page-layout";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenState, setTokenState] = useState<"loading" | "valid" | "invalid">("loading");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    setValue("token", token);
  }, [token, setValue]);

  useEffect(() => {
    if (!token) {
      setTokenState("invalid");
      return;
    }

    let active = true;

    fetch(`/api/v1/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!active) return;
        setTokenState(res.ok ? "valid" : "invalid");
      })
      .catch(() => {
        if (active) setTokenState("invalid");
      });

    return () => {
      active = false;
    };
  }, [token]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authService.resetPassword(values);
      toast.success("Password updated. You can sign in now.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  });

  if (tokenState === "loading") {
    return (
      <AuthPageLayout
        formId="reset-password-form"
        desktopTitle="Reset Password"
        desktopSubtitle="Verifying your reset link…"
        mobileTitle="Reset Password"
        submitLabel="Update password"
        renderFields={() => (
          <p className="auth-body">Please wait while we verify your link.</p>
        )}
        showSocial={false}
        hideSubmit
      />
    );
  }

  if (tokenState === "invalid") {
    return (
      <AuthPageLayout
        formId="reset-password-form"
        desktopTitle="Link expired"
        desktopSubtitle="This password reset link is invalid or has expired."
        mobileTitle="Link expired"
        submitLabel="Update password"
        renderFields={() => (
          <p className="auth-body">
            Request a new reset link and try again.
          </p>
        )}
        showSocial={false}
        hideSubmit
        desktopFooter={
          <p className="auth-muted text-center">
            <Link href="/forgot-password" className="auth-link">
              Request new link
            </Link>
            {" · "}
            <Link href="/login" className="auth-link">
              Back to Login
            </Link>
          </p>
        }
      />
    );
  }

  const renderFields = (variant: "desktop" | "mobile") => (
    <div className="space-y-4">
      <input type="hidden" {...register("token")} />
      <AuthField
        id={`${variant}-password`}
        label="New Password"
        type="password"
        placeholder="At least 8 characters"
        variant={variant}
        error={errors.password?.message}
        disabled={isSubmitting}
        autoComplete="new-password"
        {...register("password")}
      />
      <AuthField
        id={`${variant}-confirm-password`}
        label="Confirm Password"
        type="password"
        placeholder="Re-enter password"
        variant={variant}
        error={errors.confirmPassword?.message}
        disabled={isSubmitting}
        autoComplete="new-password"
        {...register("confirmPassword")}
      />
    </div>
  );

  return (
    <AuthPageLayout
      formId="reset-password-form"
      desktopTitle="Reset Password"
      desktopSubtitle={`Choose a new password for your ${appConfig.name} account.`}
      mobileTitle="Reset Password"
      submitLabel="Update password"
      renderFields={renderFields}
      showSocial={false}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      desktopFooter={
        <p className="auth-muted text-center">
          <Link href="/login" className="auth-link">
            Back to Login
          </Link>
        </p>
      }
    />
  );
}

export function ResetPasswordPageContent() {
  return (
    <Suspense
      fallback={
        <AuthPageLayout
          formId="reset-password-form"
          desktopTitle="Reset Password"
          desktopSubtitle="Loading…"
          mobileTitle="Reset Password"
          submitLabel="Update password"
          renderFields={() => null}
          showSocial={false}
          hideSubmit
        />
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
