import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeOtpSessionToken, signMobileAccessToken } from "@/lib/auth";
import { UserRole, createApiError, createApiResponse } from "@/shared";
import { isStaffRole } from "@/shared/permissions";
import { z } from "zod";

const sessionSchema = z.object({
  email: z.string().email(),
  otpSessionToken: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = sessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createApiError("validation_error", parsed.error.issues[0]?.message ?? "Invalid input"),
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const session = await consumeOtpSessionToken(parsed.data.otpSessionToken, email);
    if (!session) {
      return NextResponse.json(createApiError("invalid_session", "Session expired. Sign in again."), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.isActive) {
      return NextResponse.json(createApiError("user_not_found", "Account not found"), { status: 404 });
    }

    if (isStaffRole(user.role as UserRole)) {
      return NextResponse.json(
        createApiError("staff_portal_required", "Staff accounts must sign in at the staff portal."),
        { status: 403 },
      );
    }

    const name = `${user.firstName} ${user.lastName}`.trim() || user.firstName;
    const accessToken = signMobileAccessToken({
      id: user.id,
      email: user.email,
      name,
      role: user.role as UserRole,
      onboardingCompleted: user.onboardingCompleted,
    });

    return NextResponse.json(
      createApiResponse({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
        },
      }),
    );
  } catch (error) {
    console.error("Mobile session error:", error);
    return NextResponse.json(createApiError("server_error", "Something went wrong"), { status: 500 });
  }
}
