import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/shared";

export async function GET(request: NextRequest) {
  return NextResponse.json(createApiResponse([], "reports endpoint - GET"));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(createApiResponse(body, "reports endpoint - POST"), { status: 201 });
}
