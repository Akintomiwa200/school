import { NextRequest, NextResponse } from "next/server";
import { resetPasswordWithToken, verifyPasswordResetToken } from "@/lib/auth/password-reset";
import { createApiError, createApiResponse, resetPasswordSchema } from "@/shared";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(createApiError("missing_token", "Reset token is required"), {
      status: 400,
    });
  }

  const verified = await verifyPasswordResetToken(token);

  if (!verified) {
    return NextResponse.json(
      createApiError("invalid_or_expired_token", "This reset link is invalid or has expired"),
      { status: 400 },
    );
  }

  return NextResponse.json(createApiResponse({ valid: true }, "Token is valid"));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createApiError("validation_error", parsed.error.issues[0]?.message ?? "Invalid input"),
        { status: 400 },
      );
    }

    const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);

    if (!result.ok) {
      return NextResponse.json(
        createApiError("invalid_or_expired_token", "This reset link is invalid or has expired"),
        { status: 400 },
      );
    }

    return NextResponse.json(createApiResponse(null, "Password updated successfully"));
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(createApiError("server_error", "Something went wrong"), {
      status: 500,
    });
  }
}
