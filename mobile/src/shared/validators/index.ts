import { z } from "zod";
import { UserRole } from "../types";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const studentSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  admissionNumber: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().optional(),
  rollNumber: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  parentId: z.string().optional(),
});

export const feeSchema = z.object({
  name: z.string().min(1),
  classId: z.string().min(1),
  academicYearId: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.coerce.date().optional(),
  description: z.string().optional(),
});

export const paymentSchema = z.object({
  studentId: z.string().min(1),
  amount: z.number().positive(),
  method: z.string().min(1),
  feePaymentId: z.string().optional(),
});

export const expenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
  expenseDate: z.coerce.date(),
});

export const attendanceSchema = z.object({
  studentId: z.string().optional(),
  staffId: z.string().optional(),
  classId: z.string().optional(),
  date: z.coerce.date(),
  status: z.string().min(1),
  remarks: z.string().optional(),
});

export const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const assignmentSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  maxScore: z.number().positive().default(100),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(10),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  category: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  targetRoles: z.array(z.nativeEnum(UserRole)).optional(),
  targetClassIds: z.array(z.string()).optional(),
  isPinned: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type FeeInput = z.infer<typeof feeSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
