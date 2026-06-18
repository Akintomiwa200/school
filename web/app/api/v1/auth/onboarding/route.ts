import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { createApiError, createApiResponse, onboardingSchema } from "@/shared";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(createApiError("unauthorized", "Sign in required"), { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      onboardingCompleted: true,
      onboardingData: true,
      referralSource: true,
    },
  });

  if (!user) {
    return NextResponse.json(createApiError("user_not_found", "Account not found"), { status: 404 });
  }

  return NextResponse.json(createApiResponse(user));
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(createApiError("unauthorized", "Sign in required"), { status: 401 });
    }

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createApiError("validation_error", parsed.error.issues[0]?.message ?? "Invalid input"),
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        referralSource: parsed.data.referralSource,
        onboardingData: parsed.data,
      },
      select: { onboardingCompleted: true },
    });

    return NextResponse.json(
      createApiResponse(user, "Onboarding saved. One more step!"),
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(createApiError("server_error", "Something went wrong"), { status: 500 });
  }
}

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(createApiError("unauthorized", "Sign in required"), { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompleted: true },
    });

    return NextResponse.json(createApiResponse(null, "Onboarding complete"));
  } catch (error) {
    console.error("Complete onboarding error:", error);
    return NextResponse.json(createApiError("server_error", "Something went wrong"), { status: 500 });
  }
}
