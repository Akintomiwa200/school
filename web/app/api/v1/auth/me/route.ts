import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createApiError, createApiResponse } from "@/shared";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(createApiError("unauthorized", "Not authenticated"), { status: 401 });
    }

    return NextResponse.json(
      createApiResponse({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted ?? false,
      }),
    );
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(createApiError("server_error", "Something went wrong"), { status: 500 });
  }
}
