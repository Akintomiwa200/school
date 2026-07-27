import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiResponse } from "@/shared";

export async function GET() {
  const settings = await prisma.schoolSettings.findMany();

  const result: Record<string, unknown> = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }

  return NextResponse.json(createApiResponse(result, "Settings loaded"));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;

  const updates = Object.entries(body).map(async ([key, value]) => {
    return prisma.schoolSettings.upsert({
      where: { key },
      create: { key, value: value as never },
      update: { value: value as never },
    });
  });

  await Promise.all(updates);

  return NextResponse.json(createApiResponse(body, "Settings saved"));
}
