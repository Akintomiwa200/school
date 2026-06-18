import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const PASSWORD_RESET_PREFIX = "password-reset:";
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function passwordResetIdentifier(email: string) {
  return `${PASSWORD_RESET_PREFIX}${normalizeEmail(email)}`;
}

export async function createPasswordResetToken(email: string) {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user?.password || !user.isActive) {
    return null;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);
  const identifier = passwordResetIdentifier(normalizedEmail);

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return { token, user };
}

export async function verifyPasswordResetToken(token: string) {
  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record?.identifier.startsWith(PASSWORD_RESET_PREFIX)) {
    return null;
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => undefined);
    return null;
  }

  const email = record.identifier.slice(PASSWORD_RESET_PREFIX.length);

  return { email, record };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const verified = await verifyPasswordResetToken(token);
  if (!verified) {
    return { ok: false as const, error: "invalid_or_expired_token" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { email: verified.email },
      data: { password: hashedPassword },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return { ok: true as const };
}
