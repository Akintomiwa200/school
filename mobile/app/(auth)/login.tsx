import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text } from "react-native";

import { AuthShell } from "@/components/auth";
import { Button, Input } from "@/components/ui";
import { mobileConfig, networkErrors } from "@/config";
import { NetworkError } from "@/lib/api";
import { authService } from "@/services";
import { loginSchema } from "@/shared/validators";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const parsed = loginSchema.safeParse({ email, password });
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
      const res = await authService.login(parsed.data);
      if (res.data?.devCode) {
        Alert.alert("Dev code", res.data.devCode);
      }
      router.push("/(auth)/verify-code");
    } catch (error) {
      const message =
        error instanceof NetworkError
          ? networkErrors.alertMessage
          : error instanceof Error
            ? error.message
            : "Invalid email or password";
      Alert.alert("Sign in failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle={`Welcome back to ${mobileConfig.appName}`}
      footer={
        <Text style={{ textAlign: "center", color: colors.muted }}>
          Don&apos;t have an account?{" "}
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Register</Text>
            </Pressable>
          </Link>
        </Text>
      }
    >
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        error={errors.password}
      />
      <Link href="/(auth)/forgot-password" asChild>
        <Pressable>
          <Text style={{ color: colors.primary, fontWeight: "600" }}>Forgot password?</Text>
        </Pressable>
      </Link>
      <Button label="Sign in" loading={loading} onPress={() => void onSubmit()} />
    </AuthShell>
  );
}
