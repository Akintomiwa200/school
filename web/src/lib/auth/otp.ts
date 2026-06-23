import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendOtpEmail, isEmailConfigured } from "@/lib/email";

export const OTP_PREFIX = "otp:";
export const OTP_SESSION_PREFIX = "otp-session:";
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_SESSION_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function otpIdentifier(email: string) {
  return `${OTP_PREFIX}${normalizeEmail(email)}`;
}

function otpSessionIdentifier(email: string) {
  return `${OTP_SESSION_PREFIX}${normalizeEmail(email)}`;
}

function generateSixDigitCode() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function createAndSendOtp(email: string, name?: string) {
  const normalizedEmail = normalizeEmail(email);
  const code = generateSixDigitCode();
  const expires = new Date(Date.now() + OTP_EXPIRY_MS);
  const identifier = otpIdentifier(normalizedEmail);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: code, expires },
  });

  try {
    const sent = await sendOtpEmail(normalizedEmail, code, name);
    if (!sent && process.env.NODE_ENV !== "production") {
      console.info(`[dev] OTP for ${normalizedEmail}: ${code}`);
    }
  } catch (error) {
    console.error("OTP email failed:", error);
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    console.info(`[dev] OTP for ${normalizedEmail}: ${code}`);
  }

  const emailConfigured = isEmailConfigured();

  return {
    email: normalizedEmail,
    devCode: !emailConfigured && process.env.NODE_ENV !== "production" ? code : undefined,
    emailSent: emailConfigured,
  };
}

export async function verifyOtpCode(email: string, code: string) {
  const normalizedEmail = normalizeEmail(email);
  const identifier = otpIdentifier(normalizedEmail);
  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token: code },
  });

  if (!record || record.expires < new Date()) {
    if (record) {
      await prisma.verificationToken.delete({ where: { token: record.token } }).catch(() => undefined);
    }
    return null;
  }

  await prisma.verificationToken.delete({ where: { token: record.token } });
  return { email: normalizedEmail };
}

export async function createOtpSessionToken(userId: string, email: string) {
  const normalizedEmail = normalizeEmail(email);
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + OTP_SESSION_EXPIRY_MS);
  const identifier = otpSessionIdentifier(normalizedEmail);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return { token, userId, email: normalizedEmail };
}

export async function consumeOtpSessionToken(token: string, email: string) {
  const normalizedEmail = normalizeEmail(email);
  const identifier = otpSessionIdentifier(normalizedEmail);
  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token },
  });

  if (!record || record.expires < new Date()) {
    return null;
  }

  await prisma.verificationToken.delete({ where: { token: record.token } });
  return { email: normalizedEmail };
}
