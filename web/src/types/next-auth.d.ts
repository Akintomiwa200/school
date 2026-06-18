import { NextAuthOptions, DefaultSession } from "next-auth";
import { UserRole } from "@/shared";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      onboardingCompleted?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    onboardingCompleted?: boolean;
  }
}
