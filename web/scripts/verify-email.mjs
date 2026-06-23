import "dotenv/config";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST?.trim();
const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS?.trim();

if (!host || !user || !pass) {
  console.error("Missing SMTP_HOST, SMTP_USER, or SMTP_PASS in .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: { user, pass },
});

const fromName = process.env.EMAIL_FROM_NAME?.trim() || "Pathway Academy";
const fromEmail = process.env.EMAIL_FROM?.trim() || user;
const to = process.argv[2] || user;

try {
  await transporter.verify();
  console.log("SMTP connection OK");

  const info = await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject: "Pathway Academy email test",
    text: "Nodemailer is configured correctly.",
    html: "<p>Nodemailer is configured correctly.</p>",
  });

  console.log(`Test email sent to ${to} (${info.messageId})`);
} catch (error) {
  console.error("Email test failed:", error);
  process.exit(1);
}
