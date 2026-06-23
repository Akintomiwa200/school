import {
  emailButton,
  emailHero,
  emailHighlightCard,
  emailNote,
  emailSteps,
  escapeHtml,
  getAppUrl,
  renderEmailLayout,
} from "./layout";

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to Pathway Academy",
    html: renderEmailLayout({
      preheader: `Welcome, ${name}`,
      body: `
        ${emailHero({ icon: "success", title: "Welcome!", subtitle: `Hi ${escapeHtml(name)}, your account is ready.` })}
        ${emailHighlightCard({ icon: "mail", title: "You're all set", bodyHtml: "Sign in to access your dashboard." })}
        ${emailButton({ label: "Go to Login", href: `${getAppUrl()}/login` })}
      `,
    }),
  }),
  verifyEmail: (url: string) => ({
    subject: "Verify Your Email",
    html: renderEmailLayout({
      preheader: "Verify your email address",
      body: `
        ${emailHero({ icon: "mail", title: "Verify Email", subtitle: "Confirm your email to continue." })}
        ${emailHighlightCard({ title: "Verification link", bodyHtml: "This secure link expires soon." })}
        ${emailButton({ label: "Verify Email", href: url })}
        ${emailNote("If you did not create an account, you can ignore this email.")}
      `,
    }),
  }),
  resetPassword: (url: string) => ({
    subject: "Reset Password",
    html: renderEmailLayout({
      preheader: "Reset your password",
      body: `
        ${emailHero({ icon: "lock", title: "Reset Password", subtitle: "Use the secure link below." })}
        ${emailButton({ label: "Reset Password", href: url })}
      `,
    }),
  }),
  feeReminder: (studentName: string, amount: string, dueDate: string) => ({
    subject: "Fee Payment Reminder",
    html: renderEmailLayout({
      preheader: `Fee due for ${studentName}`,
      body: `
        ${emailHero({ icon: "bell", title: "Fee Reminder", subtitle: `Payment due for ${escapeHtml(studentName)}.` })}
        ${emailHighlightCard({ title: "Amount due", bodyHtml: `Fee of <strong>${escapeHtml(amount)}</strong> is due on <strong>${escapeHtml(dueDate)}</strong>.` })}
      `,
    }),
  }),
  paymentReceipt: (receiptNo: string, amount: string) => ({
    subject: "Payment Receipt",
    html: renderEmailLayout({
      preheader: `Receipt ${receiptNo}`,
      body: `
        ${emailHero({ icon: "success", title: "Payment Received", subtitle: "Thank you for your payment." })}
        ${emailHighlightCard({ title: "Receipt", bodyHtml: `Receipt <strong>${escapeHtml(receiptNo)}</strong> — Amount: <strong>${escapeHtml(amount)}</strong>` })}
      `,
    }),
  }),
};
