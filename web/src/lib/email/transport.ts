import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

export function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

export function getFromAddress() {
  const from = process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || "noreply@localhost";
  const name = process.env.EMAIL_FROM_NAME?.trim() || "Pathway Academy";
  return { from, name, formatted: `${name} <${from}>` };
}

export function getContactInbox() {
  return (
    process.env.CONTACT_INBOX?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    ""
  );
}

export function getMailTransporter() {
  if (!isEmailConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}
