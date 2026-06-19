"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { appConfig } from "@/config";
import { authService } from "@/services";
import { loginSchema, type LoginInput } from "@/shared";
import { AuthField } from "./auth-field";
import { AuthPageLayout } from "./auth-page-layout";

function LoginFormFields({
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
    <div className="w-full space-y-4">
      <AuthField
        id={`${variant}-email`}
        label="Email"
        type="email"
        variant={variant}
        error={errors.email?.message}
        disabled={disabled}
        autoComplete="email"
        {...register("email")}
      />
      <AuthField
        id={`${variant}-password`}
        label="Password"
        type="password"
        variant={variant}
        error={errors.password?.message}
        disabled={disabled}
        autoComplete="current-password"
        {...register("password")}
      />
    </div>
  );
}

export function LoginPageContent() {
  const router = useRouter();

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
      const res = await authService.login(values);
      if (res.data?.devCode) {
        toast.message(`Dev code: ${res.data.devCode}`);
      } else {
        toast.success("Verification code sent to your email");
      }
      router.push("/verify-code");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid email or password";
      if (message.toLowerCase().includes("staff portal")) {
        toast.error(message, {
          action: {
            label: "Staff login",
            onClick: () => router.push("/staff/login"),
          },
        });
        return;
      }
      toast.error(message);
    }
  });

  return (
    <AuthPageLayout
      formId="login-form-mobile"
      desktopTitle="Hello!"
      desktopSubtitle={`Sign in to get started with ${appConfig.name}`}
      mobileTitle="Login"
      submitLabel="Login"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      renderFields={(variant) => (
        <LoginFormFields
          variant={variant}
          register={register}
          errors={errors}
          disabled={isSubmitting}
        />
      )}
      mobileForgotPassword
      mobileBottomText={
        <>
          New Here?{" "}
          <Link href="/register" className="font-bold underline-offset-2 hover:underline">
            Register
          </Link>
        </>
      }
      desktopFooter={
        <>
          <p className="auth-muted text-center">
            <Link href="/forgot-password" className="auth-link">
              Forgot Password
            </Link>
          </p>
          <p className="auth-muted pt-2 text-center">
            No account?{" "}
            <Link href="/register" className="auth-link">
              Sign Up
            </Link>
          </p>
        </>
      }
    />
  );
}
