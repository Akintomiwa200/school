import { NextRequest, NextResponse } from "next/server";
import { appConfig } from "@/config";
import { sendPasswordResetEmail } from "@/lib/email";
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

    if (result) {
      const resetUrl = `${appConfig.url}/reset-password?token=${result.token}`;
      try {
        await sendPasswordResetEmail(
          result.user.email,
          resetUrl,
          `${result.user.firstName} ${result.user.lastName}`.trim(),
        );
      } catch (error) {
        console.error("Password reset email failed:", error);
      }
    }

    return NextResponse.json(
      createApiResponse(
        null,
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
