import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/shared";

export async function GET(request: NextRequest) {
  return NextResponse.json(createApiResponse([], "subjects endpoint - GET"));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(createApiResponse(body, "subjects endpoint - POST"), { status: 201 });
}
