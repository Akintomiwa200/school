import { Resend } from "resend";
import { EMAIL_SUBJECTS, EMAIL_TEMPLATES } from "@/shared/constants";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM ?? "noreply@school-lms.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? "School LMS";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS[EMAIL_TEMPLATES.WELCOME],
    html: `<h1>Welcome, ${name}!</h1><p>Your account has been created successfully.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS[EMAIL_TEMPLATES.RESET_PASSWORD],
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  });
}

export async function sendFeeReminderEmail(to: string, studentName: string, amount: number, dueDate: string) {
  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS[EMAIL_TEMPLATES.FEE_REMINDER],
    html: `<p>Fee reminder for ${studentName}: $${amount} due by ${dueDate}.</p>`,
  });
}

export async function sendPaymentReceiptEmail(to: string, receiptNumber: string, amount: number) {
  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS[EMAIL_TEMPLATES.PAYMENT_RECEIPT],
    html: `<p>Payment received. Receipt: ${receiptNumber}, Amount: $${amount}.</p>`,
  });
}

export * from "./templates";
