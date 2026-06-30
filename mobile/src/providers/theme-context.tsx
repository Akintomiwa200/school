import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";

import {
  THEME_STORAGE_KEY,
  themeColors,
  type ThemeMode,
  type ThemePreference,
} from "@/config/colors";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ThemeMode;
  colors: (typeof themeColors)[ThemeMode];
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(preference: ThemePreference, systemScheme: ThemeMode | null | undefined): ThemeMode {
  if (preference === "system") {
    return systemScheme === "dark" ? "dark" : "light";
  }
  return preference;
}

async function loadStoredPreference(): Promise<ThemePreference | null> {
  try {
    const stored = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Ignore read errors — fall back to system preference.
  }
  return null;
}

async function persistPreference(preference: ThemePreference) {
  try {
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, preference);
  } catch {
    // Ignore write errors — theme still applies for the session.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    void loadStoredPreference().then((stored) => {
      if (stored) {
        setPreferenceState(stored);
      }
    });
  }, []);

  const resolvedTheme = resolveTheme(preference, systemScheme);
  const colors = themeColors[resolvedTheme];

  useEffect(() => {
    setColorScheme(resolvedTheme);
  }, [resolvedTheme, setColorScheme]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void persistPreference(next);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      colors,
      setPreference,
    }),
    [preference, resolvedTheme, colors, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export { ThemeContext };
