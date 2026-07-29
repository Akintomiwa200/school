import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse, createApiError } from "@/shared";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const sessionUser = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        school: { select: { name: true } },
        staff: { select: { department: true, designation: true } },
      },
    });

    if (!user) {
      return NextResponse.json(createApiError("not_found", "User not found"), { status: 404 });
    }

    return NextResponse.json(
      createApiResponse(
        {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          memberSince: user.createdAt.toISOString(),
          school: user.school?.name ?? null,
          department: user.staff?.department ?? null,
          jobTitle: user.staff?.designation ?? null,
        },
        "Profile loaded",
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load profile";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(createApiError("profile_load_failed", message), { status });
  }
}
