export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to School LMS",
    html: `<div><h1>Welcome, ${name}!</h1><p>Your account is ready.</p></div>`,
  }),
  verifyEmail: (url: string) => ({
    subject: "Verify Your Email",
    html: `<div><p>Please verify your email: <a href="${url}">Verify</a></p></div>`,
  }),
  resetPassword: (url: string) => ({
    subject: "Reset Password",
    html: `<div><p>Reset your password: <a href="${url}">Reset</a></p></div>`,
  }),
  feeReminder: (studentName: string, amount: string, dueDate: string) => ({
    subject: "Fee Payment Reminder",
    html: `<div><p>Fee of ${amount} for ${studentName} is due on ${dueDate}.</p></div>`,
  }),
  paymentReceipt: (receiptNo: string, amount: string) => ({
    subject: "Payment Receipt",
    html: `<div><p>Receipt ${receiptNo} - Amount: ${amount}</p></div>`,
  }),
};
