import type { PaymentMethod, PaymentStatus, ExpenseCategory } from "./index";

export interface FeeStructure {
  id: string;
  name: string;
  classId: string;
  academicYearId: string;
  amount: number;
  dueDate?: Date;
  description?: string;
  isActive: boolean;
}

export interface FeePayment {
  id: string;
  studentId: string;
  feeStructureId: string;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  dueDate: Date;
  createdAt: Date;
}

export interface Payment {
  id: string;
  feePaymentId?: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  receiptNumber: string;
  paidAt?: Date;
  createdAt: Date;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  receiptUrl?: string;
  approvedBy?: string;
  createdBy: string;
  expenseDate: Date;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId?: string;
  amount: number;
  status: PaymentStatus;
  dueDate: Date;
  items: InvoiceItem[];
  createdAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PayrollEntry {
  id: string;
  staffId: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: PaymentStatus;
  paidAt?: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
