import {
  EXPENSES,
  type ExpenseEntry,
  type ExpenseStatus,
} from "@/components/dashboard/accountant/accountant-data";

let expenses: ExpenseEntry[] = [...EXPENSES];

export function getMutableExpenses() {
  return expenses;
}

export function getExpenseById(id: string) {
  return expenses.find((expense) => expense.id === id);
}

export function updateExpenseStatus(id: string, status: ExpenseStatus) {
  const expense = expenses.find((entry) => entry.id === id);
  if (!expense) return null;

  const before = expense.status;
  expenses = expenses.map((entry) => (entry.id === id ? { ...entry, status } : entry));
  const updated = expenses.find((entry) => entry.id === id)!;

  return { updated, before };
}

export function approveExpense(id: string) {
  return updateExpenseStatus(id, "approved");
}

export function rejectExpense(id: string) {
  return updateExpenseStatus(id, "rejected");
}

export function markExpensePaid(id: string) {
  return updateExpenseStatus(id, "paid");
}

export function addExpense(input: Omit<ExpenseEntry, "id">) {
  const expense: ExpenseEntry = { ...input, id: `exp-${Date.now()}` };
  expenses = [expense, ...expenses];
  return expense;
}

export function getExpenseStats(monthPrefix = new Date().toISOString().slice(0, 7)) {
  const pendingTotal = expenses
    .filter((expense) => expense.status === "pending")
    .reduce((sum, expense) => sum + expense.amount, 0);
  const monthTotal = expenses
    .filter((expense) => expense.date.startsWith(monthPrefix))
    .reduce((sum, expense) => sum + expense.amount, 0);

  return {
    pendingTotal,
    monthTotal,
    count: expenses.length,
    monthPrefix,
  };
}
