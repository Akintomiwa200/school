import { Resend } from "resend";
import { EMAIL_SUBJECTS, EMAIL_TEMPLATES } from "@/shared/constants";

const FROM_EMAIL = process.env.EMAIL_FROM ?? "noreply@school-lms.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? "School LMS";

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const resend = getResendClient();

  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not configured");
    }
    console.warn("Email skipped: RESEND_API_KEY is not configured");
    return null;
  }

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

export async function sendOtpEmail(to: string, code: string, name?: string) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return sendEmail({
    to,
    subject: "Your verification code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1e293b">
        <h1 style="color:#5d21d0;font-size:22px">${greeting}</h1>
        <p>Use this code to continue signing in to Pathway Academy:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:0.35em;color:#5d21d0;margin:24px 0">${code}</p>
        <p style="font-size:14px;color:#64748b">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>
    `,
    text: `${greeting}\n\nYour verification code: ${code}\n\nExpires in 10 minutes.`,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, name?: string) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS[EMAIL_TEMPLATES.RESET_PASSWORD],
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1e293b">
        <h1 style="color:#5d21d0;font-size:22px">${greeting}</h1>
        <p>We received a request to reset your password. Click the button below to choose a new one.</p>
        <p style="margin:28px 0">
          <a href="${resetUrl}" style="background:#5d21d0;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Reset Password
          </a>
        </p>
        <p style="font-size:14px;color:#64748b">This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>
        <p style="font-size:12px;color:#94a3b8;word-break:break-all">${resetUrl}</p>
      </div>
    `,
    text: `${greeting}\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
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
