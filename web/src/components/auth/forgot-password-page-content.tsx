"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { appConfig } from "@/config";
import { authService } from "@/services";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/shared";
import { AuthField } from "./auth-field";
import { AuthPageLayout } from "./auth-page-layout";

export function ForgotPasswordPageContent() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authService.forgotPassword(values);
      setSent(true);
      toast.success("Check your email for a reset link.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  });

  const renderFields = (variant: "desktop" | "mobile") => {
    if (sent) {
      return (
        <div className="auth-body space-y-3">
          <p>
            If an account exists for that email, we sent a password reset link. The link expires in
            1 hour.
          </p>
          <p>Did not receive it? Check spam or try again with the same email address.</p>
        </div>
      );
    }

    return (
      <AuthField
        id={`${variant}-email`}
        label="Email"
        type="email"
        placeholder="Email Address"
        variant={variant}
        error={errors.email?.message}
        disabled={isSubmitting}
        {...register("email")}
      />
    );
  };

  return (
    <AuthPageLayout
      formId="forgot-password-form"
      formSide="left"
      desktopTitle={sent ? "Check your email" : "Forgot Password?"}
      desktopSubtitle={
        sent
          ? "Follow the link in your inbox to reset your password."
          : `Enter your email and we will send you a reset link for ${appConfig.name}.`
      }
      mobileTitle={sent ? "Check your email" : "Forgot Password?"}
      submitLabel={sent ? "Resend link" : "Send reset link"}
      renderFields={renderFields}
      showSocial={false}
      mobileSubmit="inline"
      hideSubmit={false}
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
