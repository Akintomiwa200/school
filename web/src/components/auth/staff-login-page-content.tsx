"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/shared";
import { getRoleDashboardPath } from "@/shared/permissions";
import { UserRole } from "@/shared";
import { AuthField } from "./auth-field";
import { StaffAuthLayout } from "./staff-auth-layout";

const LOGIN_PATHS = ["/staff/login", "/login", "/register"];

function resolveCallbackUrl(callbackUrl: string | null) {
  if (!callbackUrl || !callbackUrl.startsWith("/")) return null;
  const path = callbackUrl.split("?")[0] ?? callbackUrl;
  if (LOGIN_PATHS.includes(path)) return null;
  return callbackUrl;
}

function StaffLoginFormFields({
  variant,
  register,
  errors,
  disabled,
}: {
  variant: "desktop" | "mobile";
  register: ReturnType<typeof useForm<LoginInput>>["register"];
  errors: ReturnType<typeof useForm<LoginInput>>["formState"]["errors"];
  disabled?: boolean;
}) {
  return (
    <>
      <AuthField
        id={`${variant}-staff-email`}
        label="Username or email"
        type="email"
        variant={variant}
        error={errors.email?.message}
        disabled={disabled}
        autoComplete="email"
        {...register("email")}
      />
      <div>
        <AuthField
          id={`${variant}-staff-password`}
          label="Password"
          type="password"
          variant={variant}
          error={errors.password?.message}
          disabled={disabled}
          autoComplete="current-password"
          {...register("password")}
        />
        <p className="mt-2 text-right text-xs">
          <Link href="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </p>
      </div>
    </>
  );
}

function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = resolveCallbackUrl(searchParams.get("callbackUrl"));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    shouldUnregister: true,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await signIn("staff-credentials", {
        email: values.email.trim().toLowerCase(),
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }

      toast.success("Signed in successfully");

      if (callbackUrl) {
        router.push(callbackUrl);
        router.refresh();
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = (await sessionRes.json()) as { user?: { role?: UserRole } };
      const role = session.user?.role ?? UserRole.ADMIN;
      router.push(getRoleDashboardPath(role));
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  });

  return (
    <StaffAuthLayout
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      footer={
        <>
          Are you a student or parent?{" "}
          <Link href="/login" className="auth-link">
            Sign in here
          </Link>
        </>
      }
      renderFields={(variant) => (
        <StaffLoginFormFields
          variant={variant}
          register={register}
          errors={errors}
          disabled={isSubmitting}
        />
      )}
    />
  );
}

export function StaffLoginPageContent() {
  return (
    <Suspense
      fallback={
        <StaffAuthLayout
          isSubmitting
          onSubmit={(e) => e.preventDefault()}
          renderFields={() => <p className="auth-body text-center">Loading…</p>}
        />
      }
    >
      <StaffLoginForm />
    </Suspense>
  );
}
