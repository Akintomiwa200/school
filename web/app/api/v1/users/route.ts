import { NextRequest } from "next/server";
import { jsonData, jsonList } from "@/lib/api/route-handlers";
import { PLATFORM_USERS } from "@/components/dashboard/super-admin/super-admin-entities-data";

export async function GET(request: NextRequest) {
  return jsonList(PLATFORM_USERS, "Users loaded", request, ["name", "email", "role", "school"]);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return jsonData(body, "User created", 201);
}
