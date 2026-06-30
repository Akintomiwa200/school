import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text } from "react-native";

import { AuthShell } from "@/components/auth";
import { Button, Input } from "@/components/ui";
import { networkErrors } from "@/config";
import { NetworkError } from "@/lib/api";
import { authService } from "@/services";
import { resetPasswordSchema } from "@/shared/validators";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { token: routeToken } = useLocalSearchParams<{ token?: string }>();
  const token = typeof routeToken === "string" ? routeToken : "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tokenState, setTokenState] = useState<"loading" | "valid" | "invalid">("loading");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenState("invalid");
      return;
    }

    let active = true;
    authService
      .validateResetToken(token)
      .then((valid) => {
        if (active) setTokenState(valid ? "valid" : "invalid");
      })
      .catch(() => {
        if (active) setTokenState("invalid");
      });

    return () => {
      active = false;
    };
  }, [token]);

  const onSubmit = async () => {
    const parsed = resetPasswordSchema.safeParse({ token, password, confirmPassword });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await authService.resetPassword(parsed.data);
      Alert.alert("Password updated", "You can sign in with your new password.");
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert(
        "Reset failed",
        error instanceof NetworkError
          ? networkErrors.alertMessage
          : error instanceof Error
            ? error.message
            : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  if (tokenState === "loading") {
    return (
      <AuthShell title="Reset password" subtitle="Verifying your reset link…">
        <ActivityIndicator color={colors.primary} />
      </AuthShell>
    );
  }

  if (tokenState === "invalid") {
    return (
      <AuthShell
        title="Link expired"
        subtitle="This reset link is invalid or has expired. Request a new one from the sign-in screen."
        footer={
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable>
              <Text style={{ textAlign: "center", color: colors.primary, fontWeight: "700" }}>
                Request new link
              </Text>
            </Pressable>
          </Link>
        }
      >
        <Text style={{ color: colors.muted }}>Password reset links expire after 1 hour.</Text>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset password" subtitle="Choose a new password for your account.">
      <Input
        label="New password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        error={errors.password}
      />
      <Input
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoComplete="new-password"
        error={errors.confirmPassword}
      />
      <Button label="Update password" loading={loading} onPress={() => void onSubmit()} />
    </AuthShell>
  );
}
