import jwt from "jsonwebtoken";
import { UserRole } from "@/shared";

export type MobileTokenUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  onboardingCompleted: boolean;
};

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured");
  return secret;
}

export function signMobileAccessToken(user: MobileTokenUser) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
    },
    getSecret(),
    { expiresIn: "30d" },
  );
}

export function verifyMobileAccessToken(token: string): MobileTokenUser | null {
  try {
    const payload = jwt.verify(token, getSecret()) as jwt.JwtPayload;
    if (!payload.sub || !payload.email || !payload.role) return null;

    return {
      id: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name ?? ""),
      role: payload.role as UserRole,
      onboardingCompleted: Boolean(payload.onboardingCompleted),
    };
  } catch {
    return null;
  }
}
