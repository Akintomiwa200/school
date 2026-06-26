import { NextRequest } from "next/server";
import { jsonData, jsonList } from "@/lib/api/route-handlers";
import { getMutableIssues, issueBook } from "@/lib/api/library-entity-store";

export async function GET(request: NextRequest) {
  return jsonList(getMutableIssues(), "Issues loaded", request, [
    "bookTitle",
    "borrower",
    "borrowerId",
  ]);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.bookId || !body.borrower || !body.borrowerId || !body.borrowerType) {
    return jsonData({ error: "Missing required fields" }, "Validation failed", 400);
  }
  const issue = issueBook({
    bookId: String(body.bookId),
    borrower: String(body.borrower),
    borrowerId: String(body.borrowerId),
    borrowerType: body.borrowerType,
    dueDate: body.dueDate,
  });
  if (!issue) {
    return jsonData({ error: "Book unavailable" }, "Cannot issue book", 400);
  }
  return jsonData(issue, "Book issued", 201);
}
