import { EMAIL_SUBJECTS, EMAIL_TEMPLATES } from "@/shared/constants";
import { getContactInbox, getFromAddress, getMailTransporter, isEmailConfigured } from "./transport";
import {
  emailButton,
  emailCodeDisplay,
  emailHero,
  emailHighlightCard,
  emailNote,
  emailSteps,
  escapeHtml,
  getAppName,
  getAppUrl,
  renderEmailLayout,
} from "./layout";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export type SendEmailResult = { messageId: string };

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailOptions): Promise<SendEmailResult | null> {
  const transporter = getMailTransporter();

  if (!transporter) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment.",
      );
    }

    console.warn(
      "[email] Skipped — configure SMTP_HOST, SMTP_USER, and SMTP_PASS in .env to send emails.",
    );
    return null;
  }

  try {
    const { formatted } = getFromAddress();
    const info = await transporter.sendMail({
      from: formatted,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text,
      replyTo: replyTo ?? process.env.EMAIL_REPLY_TO?.trim(),
    });

    return { messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
}

export { isEmailConfigured };

export async function sendWelcomeEmail(to: string, name: string) {
  const safeName = escapeHtml(name);
  const appUrl = getAppUrl();

  const html = renderEmailLayout({
    preheader: `Welcome to ${getAppName()} — your account is ready.`,
    body: `
      ${emailHero({
        icon: "success",
        title: "Welcome!",
        subtitle: `Hi ${safeName}, your account is ready.`,
      })}
      ${emailHighlightCard({
        icon: "mail",
        title: "You're all set",
        bodyHtml: `Sign in to access your dashboard, classes, assignments, and school updates from <strong>${escapeHtml(getAppName())}</strong>.`,
      })}
      ${emailSteps({
        steps: [
          "Complete your onboarding profile",
          "Explore your classes and timetable",
          "Turn on notifications for important school updates",
        ],
      })}
      ${emailButton({ label: "Go to Dashboard", href: `${appUrl}/login` })}
    `,
  });

  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS[EMAIL_TEMPLATES.WELCOME],
    html,
    text: `Welcome, ${name}! Your account is ready. Sign in at ${appUrl}/login`,
  });
}

export async function sendOtpEmail(to: string, code: string, name?: string) {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi,";
  const appUrl = getAppUrl();

  const html = renderEmailLayout({
    preheader: `Your verification code is ${code}`,
    body: `
      ${emailHero({
        icon: "lock",
        title: "Verification Code",
        subtitle: `${greeting} use the code below to continue signing in.`,
      })}
      ${emailHighlightCard({
        icon: "mail",
        title: "Your one-time code",
        bodyHtml: `Enter this code on the verification screen. It expires in <strong>10 minutes</strong>.${emailCodeDisplay(code)}`,
      })}
      ${emailSteps({
        steps: [
          "Return to the sign-in page on your device",
          "Enter the 6-digit code exactly as shown",
          "Complete sign-in to access your account",
        ],
      })}
      ${emailNote("If you did not request this code, you can safely ignore this email.")}
      ${emailButton({ label: "Back to Sign In", href: `${appUrl}/login`, variant: "outline" })}
    `,
  });

  return sendEmail({
    to,
    subject: "Your verification code",
    html,
    text: `${name ? `Hi ${name},` : "Hi,"}\n\nYour verification code: ${code}\n\nExpires in 10 minutes.`,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, name?: string) {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi,";
  const appUrl = getAppUrl();

  const html = renderEmailLayout({
    preheader: "Reset your Pathway Academy password",
    body: `
      ${emailHero({
        icon: "lock",
        title: "Reset Password",
        subtitle: `${greeting} we received a request to reset your password.`,
      })}
      ${emailHighlightCard({
        icon: "mail",
        title: "Secure reset link",
        bodyHtml: `Tap the button below to choose a new password. This link expires in <strong>1 hour</strong>.`,
      })}
      ${emailButton({ label: "Reset Password", href: resetUrl })}
      ${emailSteps({
        steps: [
          "Open the secure reset link on this device",
          "Choose a strong new password",
          "Sign in again with your updated credentials",
        ],
      })}
      ${emailNote("If you did not request a password reset, you can ignore this email.")}
      ${emailButton({ label: "Back to Home", href: appUrl, variant: "outline" })}
    `,
  });

  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS[EMAIL_TEMPLATES.RESET_PASSWORD],
    html,
    text: `${name ? `Hi ${name},` : "Hi,"}\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
  });
}

export async function sendContactFormEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const inbox = getContactInbox();
  if (!inbox) {
    throw new Error("CONTACT_INBOX or EMAIL_FROM is not configured");
  }

  const safeName = escapeHtml(params.name.trim());
  const safeSubject = escapeHtml(params.subject.trim());
  const safeMessage = escapeHtml(params.message.trim());
  const safeEmail = escapeHtml(params.email.trim());

  const html = renderEmailLayout({
    preheader: `New contact message from ${params.name.trim()}`,
    body: `
      ${emailHero({
        icon: "mail",
        title: "New Contact Message",
        subtitle: "A visitor submitted the contact form on your website.",
      })}
      ${emailHighlightCard({
        title: safeSubject,
        bodyHtml: `
          <p style="margin:0 0 12px;"><strong>From:</strong> ${safeName}<br /><strong>Email:</strong> ${safeEmail}</p>
          <div style="margin-top:16px;padding:16px;background:#ffffff;border-radius:12px;text-align:left;white-space:pre-wrap;">${safeMessage}</div>
        `,
      })}
      ${emailNote("Reply directly to this sender using the reply-to address.")}
    `,
  });

  return sendEmail({
    to: inbox,
    replyTo: params.email,
    subject: `[Contact] ${params.subject.trim()}`,
    html,
    text: `From: ${params.name.trim()} <${params.email}>\nSubject: ${params.subject.trim()}\n\n${params.message.trim()}`,
  });
}

export async function sendContactConfirmationEmail(to: string, name: string) {
  const safeName = escapeHtml(name.trim());
  const appUrl = getAppUrl();

  const html = renderEmailLayout({
    preheader: "We received your message and will reply soon.",
    body: `
      ${emailHero({
        icon: "success",
        title: "Thank You!",
        subtitle: "Your information has been received.",
      })}
      ${emailHighlightCard({
        icon: "mail",
        title: "Check Your Inbox",
        bodyHtml: `We'll reply to you at your email address within <strong>1 to 2 business days</strong>, ${safeName}.`,
      })}
      ${emailSteps({
        steps: [
          "Our team reviews your message",
          "We prepare a helpful response for your request",
          "You'll receive our reply directly in your inbox",
        ],
      })}
      ${emailButton({ label: "Back to Home", href: appUrl, variant: "outline" })}
    `,
  });

  return sendEmail({
    to,
    subject: "We received your message",
    html,
    text: `Thanks, ${name.trim()}! We received your message and will reply within 1–2 business days.`,
  });
}

export async function sendNotificationEmail(params: {
  to: string;
  name?: string;
  title: string;
  message: string;
  link?: string;
}) {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,";
  const appUrl = getAppUrl();
  const actionLink = params.link?.startsWith("http")
    ? params.link
    : params.link
      ? `${appUrl}${params.link}`
      : appUrl;

  const html = renderEmailLayout({
    preheader: params.message,
    body: `
      ${emailHero({
        icon: "bell",
        title: escapeHtml(params.title),
        subtitle: `${greeting} you have a new notification.`,
      })}
      ${emailHighlightCard({
        icon: "mail",
        title: "Notification details",
        bodyHtml: escapeHtml(params.message),
      })}
      ${
        params.link
          ? emailButton({ label: "View Details", href: actionLink })
          : emailButton({ label: "Open Dashboard", href: appUrl })
      }
      ${emailButton({ label: "Back to Home", href: appUrl, variant: "outline" })}
    `,
  });

  return sendEmail({
    to: params.to,
    subject: params.title,
    html,
    text: `${params.name ? `Hi ${params.name},` : "Hi,"}\n\n${params.title}\n\n${params.message}${params.link ? `\n\n${actionLink}` : ""}`,
  });
}

export async function sendFeeReminderEmail(to: string, studentName: string, amount: number, dueDate: string) {
  const appUrl = getAppUrl();
  const safeStudent = escapeHtml(studentName);

  const html = renderEmailLayout({
    preheader: `Fee reminder: $${amount} due by ${dueDate}`,
    body: `
      ${emailHero({
        icon: "bell",
        title: "Fee Payment Reminder",
        subtitle: `A payment is due for ${safeStudent}.`,
      })}
      ${emailHighlightCard({
        title: "Payment due soon",
        bodyHtml: `Amount: <strong>$${amount}</strong><br />Due date: <strong>${escapeHtml(dueDate)}</strong>`,
      })}
      ${emailSteps({
        steps: [
          "Review the fee details in your dashboard",
          "Complete payment before the due date",
          "Download your receipt after payment",
        ],
      })}
      ${emailButton({ label: "View Fees", href: `${appUrl}/login` })}
    `,
  });

  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS[EMAIL_TEMPLATES.FEE_REMINDER],
    html,
    text: `Fee reminder for ${studentName}: $${amount} due by ${dueDate}.`,
  });
}

export async function sendPaymentReceiptEmail(to: string, receiptNumber: string, amount: number) {
  const appUrl = getAppUrl();

  const html = renderEmailLayout({
    preheader: `Payment receipt ${receiptNumber}`,
    body: `
      ${emailHero({
        icon: "success",
        title: "Payment Received",
        subtitle: "Thank you — your payment was successful.",
      })}
      ${emailHighlightCard({
        title: "Receipt details",
        bodyHtml: `Receipt: <strong>${escapeHtml(receiptNumber)}</strong><br />Amount: <strong>$${amount}</strong>`,
      })}
      ${emailSteps({
        steps: [
          "Keep this email for your records",
          "View the full receipt in your dashboard",
          "Contact support if you need help",
        ],
      })}
      ${emailButton({ label: "View Receipt", href: `${appUrl}/login` })}
    `,
  });

  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS[EMAIL_TEMPLATES.PAYMENT_RECEIPT],
    html,
    text: `Payment received. Receipt: ${receiptNumber}, Amount: $${amount}.`,
  });
}

export * from "./layout";
export * from "./templates";
