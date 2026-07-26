import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text } from "react-native";

import { AuthShell } from "@/components/auth";
import { Button, Input } from "@/components/ui";
import { networkErrors } from "@/config";
import { NetworkError } from "@/lib/api";
import { authService } from "@/services";
import { forgotPasswordSchema } from "@/shared/validators";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function ForgotPasswordScreen() {
  const colors = useThemeColors();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const onSubmit = async () => {
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors({ email: parsed.error.issues[0]?.message ?? "Invalid email" });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await authService.forgotPassword(parsed.data);
      setSent(true);
      if (res.data?.devResetUrl) {
        setDevResetUrl(res.data.devResetUrl);
      }
    } catch (error) {
      const message =
        error instanceof NetworkError
          ? networkErrors.alertMessage
          : error instanceof Error
            ? error.message
            : "Something went wrong";
      Alert.alert("Request failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={sent ? "Check your email" : "Forgot password?"}
      subtitle={
        sent
          ? "If an account exists for that email, we sent a password reset link."
          : "Enter your email and we will send you a reset link."
      }
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
      {sent ? (
        <Text style={{ color: colors.muted, lineHeight: 22 }}>
          The link expires in 1 hour. Check spam or try again with the same email if needed.
          {devResetUrl ? `\n\nDev reset link:\n${devResetUrl}` : ""}
        </Text>
      ) : (
        <>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
          />
          <Button label="Send reset link" loading={loading} onPress={() => void onSubmit()} />
        </>
      )}
    </AuthShell>
  );
}
