import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAndSendOtp, createOtpSessionToken, verifyOtpCode } from "@/lib/auth/otp";
import { clearPendingAuth, getPendingAuth } from "@/lib/auth/pending-auth";
import { createApiError, createApiResponse, verifyCodeSchema } from "@/shared";

export async function GET() {
  const pending = await getPendingAuth();
  if (!pending) {
    return NextResponse.json(createApiError("no_pending_auth", "No verification in progress"), {
      status: 401,
    });
  }

  const masked = pending.email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

  return NextResponse.json(
    createApiResponse({
      email: pending.email,
      maskedEmail: masked,
      flow: pending.flow,
    }),
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyCodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createApiError("validation_error", parsed.error.issues[0]?.message ?? "Invalid code"),
        { status: 400 },
      );
    }

    const pending = await getPendingAuth();
    if (!pending) {
      return NextResponse.json(createApiError("no_pending_auth", "Verification session expired"), {
        status: 401,
      });
    }

    const verified = await verifyOtpCode(pending.email, parsed.data.code);
    if (!verified) {
      return NextResponse.json(createApiError("invalid_code", "Invalid or expired code"), {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({ where: { id: pending.userId } });
    if (!user) {
      return NextResponse.json(createApiError("user_not_found", "Account not found"), { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    const session = await createOtpSessionToken(user.id, user.email);
    await clearPendingAuth();

    return NextResponse.json(
      createApiResponse({
        email: user.email,
        flow: pending.flow,
        otpSessionToken: session.token,
        onboardingCompleted: user.onboardingCompleted,
      }),
    );
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(createApiError("server_error", "Something went wrong"), { status: 500 });
  }
}

export async function PUT() {
  try {
    const pending = await getPendingAuth();
    if (!pending) {
      return NextResponse.json(createApiError("no_pending_auth", "Verification session expired"), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({ where: { id: pending.userId } });
    if (!user) {
      return NextResponse.json(createApiError("user_not_found", "Account not found"), { status: 404 });
    }

    const otpResult = await createAndSendOtp(
      pending.email,
      `${user.firstName} ${user.lastName}`.trim(),
    );

    return NextResponse.json(
      createApiResponse(
        { devCode: otpResult.devCode },
        "A new verification code has been sent.",
      ),
    );
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json(createApiError("server_error", "Something went wrong"), { status: 500 });
  }
}
