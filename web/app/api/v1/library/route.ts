import { NextResponse } from "next/server";
import { createApiResponse } from "@/shared";
import { getLibraryStats, getMutableBooks, getMutableIssues } from "@/lib/api/library-entity-store";

export async function GET() {
  return NextResponse.json(
    createApiResponse(
      {
        books: getMutableBooks(),
        issues: getMutableIssues(),
        stats: getLibraryStats(),
      },
      "Library data loaded",
    ),
  );
}
