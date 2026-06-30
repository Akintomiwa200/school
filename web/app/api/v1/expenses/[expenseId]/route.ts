import { NextRequest, NextResponse } from "next/server";
import { createApiError, createApiResponse } from "@/shared";
import {
  approveExpense,
  getExpenseById,
  markExpensePaid,
  rejectExpense,
} from "@/lib/api/expense-entity-store";
import { logExpenseStatusChange } from "@/lib/api/finance-audit-helpers";

type RouteContext = { params: Promise<{ expenseId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { expenseId } = await context.params;
  const expense = getExpenseById(expenseId);
  if (!expense) {
    return NextResponse.json(createApiError("not_found", "Expense not found"), { status: 404 });
  }
  return NextResponse.json(createApiResponse(expense, "Expense loaded"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { expenseId } = await context.params;
  const body = (await request.json()) as { action: "approve" | "reject" | "mark_paid"; actor?: string };

  let result = null;
  if (body.action === "approve") result = approveExpense(expenseId);
  else if (body.action === "reject") result = rejectExpense(expenseId);
  else if (body.action === "mark_paid") result = markExpensePaid(expenseId);
  else {
    return NextResponse.json(createApiError("validation", "Invalid action"), { status: 400 });
  }

  if (!result) {
    return NextResponse.json(createApiError("not_found", "Expense not found"), { status: 404 });
  }

  logExpenseStatusChange(result.updated, result.before, result.updated.status, body.actor);

  return NextResponse.json(createApiResponse(result.updated, "Expense updated"));
}
