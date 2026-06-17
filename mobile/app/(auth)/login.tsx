import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function LoginScreen() {
  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text className="mb-2 text-center text-3xl font-bold text-foreground">School LMS</Text>
      <Text className="mb-8 text-center text-muted-foreground">Sign in to your account</Text>

      <TextInput
        className="mb-4 rounded-lg border border-border bg-card px-4 py-3 text-foreground"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="mb-6 rounded-lg border border-border bg-card px-4 py-3 text-foreground"
        placeholder="Password"
        secureTextEntry
      />

      <TouchableOpacity className="rounded-lg bg-primary py-3">
        <Text className="text-center font-semibold text-primary-foreground">Sign In</Text>
      </TouchableOpacity>

      <Link href="/(auth)/forgot-password" asChild>
        <TouchableOpacity className="mt-4">
          <Text className="text-center text-primary">Forgot Password?</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
