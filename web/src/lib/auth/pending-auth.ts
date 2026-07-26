import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "auth-pending";
const MAX_AGE_SEC = 10 * 60;

type PendingAuthPayload = {
  userId: string;
  email: string;
  flow: "login" | "signup";
};

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured");
  return secret;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function encode(payload: PendingAuthPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(body);
  return `${body}.${signature}`;
}

function decode(value: string): PendingAuthPayload | null {
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;
  if (sign(body) !== signature) return null;

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as PendingAuthPayload;
  } catch {
    return null;
  }
}

export function createPendingToken(payload: PendingAuthPayload) {
  return encode(payload);
}

export function decodePendingToken(value: string): PendingAuthPayload | null {
  return decode(value);
}

export async function setPendingAuth(payload: PendingAuthPayload) {
  const token = createPendingToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function getPendingAuth() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return null;
  return decode(value);
}

export async function clearPendingAuth() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getPendingAuthFromRequest(request: NextRequest) {
  const fromCookie = await getPendingAuth();
  if (fromCookie) return fromCookie;

  const headerToken = request.headers.get("X-Pending-Auth");
  if (headerToken) return decodePendingToken(headerToken);

  return null;
}
