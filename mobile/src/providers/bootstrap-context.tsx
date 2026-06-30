import * as SplashScreen from "expo-splash-screen";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { appConfig } from "@/config/app";
import { getToken, getUser, hasSeenAppOnboarding, type StoredUser } from "@/lib/auth-storage";
import { authService } from "@/services";
import { useNetwork } from "@/providers/network-context";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

type BootstrapState = {
  isReady: boolean;
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  user: StoredUser | null;
  isOnline: boolean;
  refreshAuth: () => Promise<void>;
  refreshNetwork: () => Promise<boolean>;
  markOnboardingSeen: () => void;
};

const BootstrapContext = createContext<BootstrapState | null>(null);

export function BootstrapProvider({ children }: { children: ReactNode }) {
  const { isOnline, isChecking, refresh: refreshNetwork } = useNetwork();
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  const hydrateAuth = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      const res = await authService.me();
      if (res.data) {
        setIsAuthenticated(true);
        setUser(res.data);
        return;
      }
    } catch {
      const cached = await getUser();
      if (cached) {
        setIsAuthenticated(true);
        setUser(cached);
        return;
      }
    }

    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const refreshAuth = useCallback(async () => {
    await hydrateAuth();
  }, [hydrateAuth]);

  const markOnboardingSeen = useCallback(() => {
    setHasSeenOnboarding(true);
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const splashDelay = new Promise((resolve) => setTimeout(resolve, appConfig.splashDurationMs));
      const [seenOnboarding] = await Promise.all([hasSeenAppOnboarding(), splashDelay]);

      if (!active) return;

      setHasSeenOnboarding(seenOnboarding);
      await hydrateAuth();

      if (!active) return;
      setIsReady(true);
      await SplashScreen.hideAsync();
    }

    if (!isChecking) {
      void bootstrap();
    }

    return () => {
      active = false;
    };
  }, [hydrateAuth, isChecking]);

  const value = useMemo(
    () => ({
      isReady,
      hasSeenOnboarding,
      isAuthenticated,
      user,
      refreshAuth,
      markOnboardingSeen,
      isOnline,
      refreshNetwork,
    }),
    [
      isReady,
      hasSeenOnboarding,
      isAuthenticated,
      user,
      refreshAuth,
      markOnboardingSeen,
      isOnline,
      refreshNetwork,
    ],
  );

  return <BootstrapContext.Provider value={value}>{children}</BootstrapContext.Provider>;
}

export function useBootstrap() {
  const context = useContext(BootstrapContext);
  if (!context) {
    throw new Error("useBootstrap must be used within BootstrapProvider");
  }
  return context;
}
