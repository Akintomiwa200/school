// Shared client helper: finish email/password auth after OTP verification.

import { signIn } from "next-auth/react";

export async function completeAuthSignIn(email: string, otpSessionToken: string) {
  const result = await signIn("credentials", {
    email,
    otpSessionToken,
    redirect: false,
  });

  if (result?.error) {
    throw new Error("Could not sign you in. Please try again.");
  }

  return result;
}
