import { NextRequest, NextResponse } from "next/server";
import { appConfig } from "@/config";
import { sendPasswordResetEmail, isEmailConfigured } from "@/lib/email";
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { createApiError, createApiResponse, forgotPasswordSchema } from "@/shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createApiError("validation_error", parsed.error.issues[0]?.message ?? "Invalid email"),
        { status: 400 },
      );
    }

    const result = await createPasswordResetToken(parsed.data.email);
    let devResetUrl: string | undefined;

    if (result) {
      const resetUrl = `${appConfig.url}/reset-password?token=${result.token}`;
      const emailConfigured = isEmailConfigured();

      try {
        const sent = await sendPasswordResetEmail(
          result.user.email,
          resetUrl,
          `${result.user.firstName} ${result.user.lastName}`.trim(),
        );

        if (!sent && process.env.NODE_ENV !== "production") {
          devResetUrl = resetUrl;
          console.info(`[dev] Password reset for ${result.user.email}: ${resetUrl}`);
        }
      } catch (error) {
        console.error("Password reset email failed:", error);
        if (process.env.NODE_ENV !== "production" && !emailConfigured) {
          devResetUrl = resetUrl;
          console.info(`[dev] Password reset for ${result.user.email}: ${resetUrl}`);
        }
      }
    }

    return NextResponse.json(
      createApiResponse(
        process.env.NODE_ENV !== "production" ? { devResetUrl } : null,
        "If an account exists for that email, a reset link has been sent.",
      ),
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(createApiError("server_error", "Something went wrong"), {
      status: 500,
    });
  }
}
