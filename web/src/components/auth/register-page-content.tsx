"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { appConfig } from "@/config";
import { authService } from "@/services";
import { registerSchema, type RegisterInput, UserRole } from "@/shared";
import { AuthField } from "./auth-field";
import { AuthPageLayout } from "./auth-page-layout";

function RegisterFormFields({
  variant,
  register,
  errors,
  disabled,
}: {
  variant: "desktop" | "mobile";
  register: ReturnType<typeof useForm<RegisterInput>>["register"];
  errors: ReturnType<typeof useForm<RegisterInput>>["formState"]["errors"];
  disabled?: boolean;
}) {
  return (
    <div className="w-full space-y-4">
      <AuthField
        id={`${variant}-name`}
        label="Full Name"
        type="text"
        placeholder="Full Name"
        variant={variant}
        error={errors.fullName?.message}
        disabled={disabled}
        autoComplete="name"
        {...register("fullName")}
      />
      <AuthField
        id={`${variant}-email`}
        label="Email"
        type="email"
        placeholder="Email Address"
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
        placeholder="Password"
        variant={variant}
        error={errors.password?.message}
        disabled={disabled}
        autoComplete="new-password"
        {...register("password")}
      />
    </div>
  );
}

export function RegisterPageContent() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", role: UserRole.STUDENT },
    shouldUnregister: true,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await authService.register(values);
      if (res.data?.devCode) {
        toast.message(`Dev code: ${res.data.devCode}`);
      } else {
        toast.success("Verification code sent to your email");
      }
      router.push("/verify-code");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create account");
    }
  });

  return (
    <AuthPageLayout
      formId="register-form-mobile"
      formSide="left"
      desktopTitle="Register"
      desktopSubtitle={`Create your account with ${appConfig.name}`}
      mobileTitle="Register"
      submitLabel="Register"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      googleCallbackUrl="/auth/success?flow=google-signup"
      renderFields={(variant) => (
        <RegisterFormFields
          variant={variant}
          register={register}
          errors={errors}
          disabled={isSubmitting}
        />
      )}
      mobileBottomText={
        <>
          Already Member?{" "}
          <Link href="/login" className="font-bold underline-offset-2 hover:underline">
            Login
          </Link>
        </>
      }
      desktopFooter={
        <p className="auth-muted text-center">
          Already have an account?{" "}
          <Link href="/login" className="auth-link">
            Login
          </Link>
        </p>
      }
    />
  );
}
