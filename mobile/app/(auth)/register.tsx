import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text } from "react-native";

import { AuthShell } from "@/components/auth";
import { Button, Input } from "@/components/ui";
import { mobileConfig, networkErrors } from "@/config";
import { NetworkError } from "@/lib/api";
import { authService } from "@/services";
import { registerSchema } from "@/shared/validators";
import { UserRole } from "@/shared/types";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function RegisterScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const parsed = registerSchema.safeParse({
      fullName,
      email,
      password,
      role: UserRole.STUDENT,
    });

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
      const res = await authService.register(parsed.data);
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
            : "Could not create account";
      Alert.alert("Registration failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle={`Join ${mobileConfig.appName} to access your school dashboard`}
      footer={
        <Text style={{ textAlign: "center", color: colors.muted }}>
          Already have an account?{" "}
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign in</Text>
            </Pressable>
          </Link>
        </Text>
      }
    >
      <Input
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        autoComplete="name"
        error={errors.fullName}
      />
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
        autoComplete="new-password"
        error={errors.password}
      />
      <Button label="Create account" loading={loading} onPress={() => void onSubmit()} />
    </AuthShell>
  );
}
