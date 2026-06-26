import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import { getIssueById, returnIssue } from "@/lib/api/library-entity-store";

type RouteContext = { params: Promise<{ issueId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { issueId } = await context.params;
  const issue = getIssueById(issueId);
  if (!issue) {
    return NextResponse.json(createApiError("not_found", "Issue not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(issue, "Issue loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { issueId } = await context.params;
  const body = await request.json();
  if (body.action === "return") {
    const returned = returnIssue(issueId);
    if (!returned) {
      return NextResponse.json(createApiError("not_found", "Issue not found or already returned"), {
        status: 404,
      });
    }
    return NextResponse.json(createApiResponse(returned, "Book returned"));
  }
  return NextResponse.json(createApiError("bad_request", "Unsupported action"), { status: 400 });
}
