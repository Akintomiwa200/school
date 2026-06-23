import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { consumeOtpSessionToken } from "@/lib/auth/otp";
import { UserRole } from "@/shared";
import { getRoleDashboardPath, isConsumerRole, isStaffRole } from "@/shared/permissions";

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "User",
    lastName: parts.slice(1).join(" ") || "Account",
  };
}

async function loadUserTokenFields(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, onboardingCompleted: true },
    });
  } catch (error) {
    console.error("Failed to load user session fields:", error);
    return null;
  }
}

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const hasGoogleOAuth = Boolean(googleClientId && googleClientSecret);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(hasGoogleOAuth
      ? [
          GoogleProvider({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
          }),
        ]
      : []),
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        otpSessionToken: { label: "OTP Session Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otpSessionToken) return null;

        const email = credentials.email.trim().toLowerCase();
        const session = await consumeOtpSessionToken(credentials.otpSessionToken, email);
        if (!session) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.isActive) return null;
        if (isStaffRole(user.role as UserRole)) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role as UserRole,
          image: user.avatar,
        };
      },
    }),
    CredentialsProvider({
      id: "staff-credentials",
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.password || !user.isActive) return null;
        if (!isStaffRole(user.role as UserRole)) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        if (!user.onboardingCompleted) {
          await prisma.user.update({
            where: { id: user.id },
            data: { onboardingCompleted: true },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role as UserRole,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      try {
        const email = user.email.toLowerCase();
        const existing = await prisma.user.findUnique({ where: { email } });

        if (existing && isStaffRole(existing.role as UserRole)) {
          return false;
        }

        if (!existing) {
          const { firstName, lastName } = splitName(user.name ?? "Google User");
          const created = await prisma.user.create({
            data: {
              email,
              firstName,
              lastName,
              avatar: user.image,
              emailVerified: new Date(),
              role: UserRole.STUDENT,
            },
          });

          if (account.providerAccountId) {
            await prisma.account.create({
              data: {
                userId: created.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }
        } else if (account.providerAccountId) {
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            create: {
              userId: existing.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state,
            },
            update: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
            },
          });

          await prisma.user.update({
            where: { id: existing.id },
            data: {
              emailVerified: existing.emailVerified ?? new Date(),
              avatar: user.image ?? existing.avatar,
            },
          });
        }
      } catch (error) {
        console.error("Google signIn callback error:", error);
        return false;
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        if (user.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email.toLowerCase() },
              select: { id: true, role: true, onboardingCompleted: true },
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.role = dbUser.role as UserRole;
              token.onboardingCompleted = dbUser.onboardingCompleted ?? false;
            } else if (user.id) {
              token.id = user.id;
              token.role = (user as { role?: UserRole }).role ?? UserRole.STUDENT;
              token.onboardingCompleted = false;
            }
          } catch (error) {
            console.error("JWT user lookup error:", error);
            if (user.id) token.id = user.id;
            token.onboardingCompleted = false;
          }
        } else if (user.id) {
          token.id = user.id;
          token.role = (user as { role?: UserRole }).role ?? UserRole.STUDENT;
        }
      }

      if (token.id && (trigger === "update" || trigger === "signIn" || token.onboardingCompleted === undefined)) {
        const dbUser = await loadUserTokenFields(token.id as string);
        if (dbUser) {
          token.role = dbUser.role as UserRole;
          token.onboardingCompleted = dbUser.onboardingCompleted ?? false;
        } else {
          token.onboardingCompleted = false;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as UserRole) ?? UserRole.STUDENT;
        session.user.onboardingCompleted = token.onboardingCompleted ?? false;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

export function getDashboardRedirect(role: UserRole): string {
  return getRoleDashboardPath(role);
}

export async function getPostAuthRedirect(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true, role: true },
    });

    if (!user) return "/login";

    const role = user.role as UserRole;
    if (isStaffRole(role)) return getRoleDashboardPath(role);
    if (isConsumerRole(role) && !user.onboardingCompleted) return "/onboarding";

    return getRoleDashboardPath(role);
  } catch {
    return "/login";
  }
}

export const isGoogleAuthEnabled = hasGoogleOAuth;
