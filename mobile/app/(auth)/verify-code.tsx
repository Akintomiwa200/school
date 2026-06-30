import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text } from "react-native";

import { AuthShell, OtpInput } from "@/components/auth";
import { Button } from "@/components/ui";
import { networkErrors } from "@/config";
import { NetworkError } from "@/lib/api";
import { authService } from "@/services";
import { verifyCodeSchema } from "@/shared/validators";
import { useBootstrap } from "@/providers/bootstrap-context";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function VerifyCodeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { refreshAuth } = useBootstrap();
  const [code, setCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [flow, setFlow] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    authService
      .getVerifyCodeContext()
      .then((context) => {
        setMaskedEmail(context.maskedEmail);
        setFlow(context.flow);
      })
      .catch(() => {
        router.replace("/(auth)/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const onVerify = async () => {
    const parsed = verifyCodeSchema.safeParse({ code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter the 6-digit code");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const verifyRes = await authService.verifyCode(parsed.data.code);
      const data = verifyRes.data;
      if (!data) throw new Error("Verification failed");

      await authService.createSession(data.email, data.otpSessionToken);
      await refreshAuth();
      router.replace("/(tabs)");
    } catch (err) {
      const message =
        err instanceof NetworkError
          ? networkErrors.alertMessage
          : err instanceof Error
            ? err.message
            : "Invalid or expired code";
      setError(message);
      Alert.alert("Verification failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    try {
      const res = await authService.resendCode();
      if (res.data?.devCode) {
        Alert.alert("Dev code", res.data.devCode);
      } else {
        Alert.alert("Code sent", "A new verification code has been sent.");
      }
    } catch (error) {
      Alert.alert(
        "Could not resend",
        error instanceof NetworkError
          ? networkErrors.alertMessage
          : error instanceof Error
            ? error.message
            : "Try again later.",
      );
    }
  };

  if (loading) {
    return (
      <AuthShell title="Verify code" subtitle="Loading your verification session…">
        <ActivityIndicator color={colors.primary} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Enter verification code"
      subtitle={`We sent a 6-digit code to ${maskedEmail}. Enter it below to continue.`}
      footer={
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <Text style={{ textAlign: "center", color: colors.primary, fontWeight: "700" }}>
              Back to sign in
            </Text>
          </Pressable>
        </Link>
      }
    >
      <OtpInput value={code} onChange={setCode} disabled={submitting} error={error} />
      <Button
        label={flow === "signup" ? "Verify & continue" : "Verify & sign in"}
        loading={submitting}
        onPress={() => void onVerify()}
      />
      <Pressable onPress={() => void onResend()}>
        <Text style={{ textAlign: "center", color: colors.primary, fontWeight: "600" }}>
          Resend code
        </Text>
      </Pressable>
    </AuthShell>
  );
}
