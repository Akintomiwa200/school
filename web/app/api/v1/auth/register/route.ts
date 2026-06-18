import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createAndSendOtp } from "@/lib/auth/otp";
import { setPendingAuth } from "@/lib/auth/pending-auth";
import { UserRole, createApiError, createApiResponse, registerSchema } from "@/shared";

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? "User";
  const lastName = parts.slice(1).join(" ") || "Account";
  return { firstName, lastName };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createApiError("validation_error", parsed.error.issues[0]?.message ?? "Invalid input"),
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json(createApiError("email_exists", "An account with this email already exists"), {
        status: 409,
      });
    }

    const { firstName, lastName } = splitFullName(parsed.data.fullName);

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: parsed.data.phone,
        role: parsed.data.role ?? UserRole.STUDENT,
        isActive: true,
      },
    });

    const otpResult = await createAndSendOtp(
      email,
      `${user.firstName} ${user.lastName}`.trim(),
    );

    await setPendingAuth({ userId: user.id, email, flow: "signup" });

    return NextResponse.json(
      createApiResponse(
        {
          email,
          flow: "signup" as const,
          devCode: otpResult.devCode,
        },
        "Account created. Enter the verification code sent to your email.",
      ),
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(createApiError("server_error", "Something went wrong"), { status: 500 });
  }
}
