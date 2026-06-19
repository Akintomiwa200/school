import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createAndSendOtp } from "@/lib/auth/otp";
import { setPendingAuth } from "@/lib/auth/pending-auth";
import { createApiError, createApiResponse, loginSchema } from "@/shared";
import { isStaffRole } from "@/shared/permissions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createApiError("validation_error", parsed.error.issues[0]?.message ?? "Invalid input"),
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user?.password || !user.isActive) {
      return NextResponse.json(createApiError("invalid_credentials", "Invalid email or password"), {
        status: 401,
      });
    }

    const isValid = await bcrypt.compare(parsed.data.password, user.password);
    if (!isValid) {
      return NextResponse.json(createApiError("invalid_credentials", "Invalid email or password"), {
        status: 401,
      });
    }

    if (isStaffRole(user.role)) {
      return NextResponse.json(
        createApiError(
          "staff_portal_required",
          "Staff accounts must sign in at the staff portal.",
        ),
        { status: 403 },
      );
    }

    const otpResult = await createAndSendOtp(
      email,
      `${user.firstName} ${user.lastName}`.trim(),
    );

    await setPendingAuth({ userId: user.id, email, flow: "login" });

    return NextResponse.json(
      createApiResponse(
        {
          email,
          flow: "login" as const,
          devCode: otpResult.devCode,
        },
        "Verification code sent to your email.",
      ),
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(createApiError("server_error", "Something went wrong"), { status: 500 });
  }
}
