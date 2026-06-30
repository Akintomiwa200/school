# School mobile app

Expo (React Native) client for the school platform. It talks to the same backend as the web app in `../web`.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/)
- iOS Simulator, Android emulator, or Expo Go on a device

## Setup

From the `mobile/` folder:

```bash
pnpm install
cp .env.local.example .env.local
# Edit EXPO_PUBLIC_API_URL — use your computer's LAN IP, not localhost
```

| Environment | Typical `EXPO_PUBLIC_API_URL` |
|-------------|-------------------------------|
| iOS Simulator | `http://localhost:3000` (default) |
| Android emulator | `http://10.0.2.2:3000` (default) |
| Physical device | `http://<your-lan-ip>:3000` |

Start the web API (from `../web`):

```bash
cd ../web
pnpm install
pnpm dev
```

## Run the app

From `mobile/`:

```bash
pnpm start
```

Then press `i` (iOS), `a` (Android), or scan the QR code with Expo Go.

Other scripts:

```bash
pnpm ios
pnpm android
pnpm lint
pnpm run typecheck
```

## Project layout

```
mobile/
├── app/                 # Expo Router screens
│   ├── _layout.tsx      # Root stack + auth gate
│   ├── login.tsx
│   ├── (tabs)/          # Main tab navigator
│   └── modal.tsx
├── src/
│   ├── api/             # HTTP client + auth API
│   ├── auth/            # Session context
│   ├── config/          # API base URL + color tokens
│   ├── hooks/           # Data hooks + useThemeColors
│   ├── providers/       # ThemeProvider (light/dark/system)
│   └── styles/          # NativeWind global CSS tokens
└── components/          # Shared UI (themed text, icons)
```

## Theming

Colors match the web app (`web/src/styles/globals.css` and `web/src/config/design.ts`). Use `useTheme()` or `useThemeColors()` from `src/hooks` — do not hardcode hex values in screens.

Theme preference (`light` / `dark` / `system`) is persisted in SecureStore via `ThemeProvider`.

## Startup flow

1. **Splash** — native splash stays visible for 3 seconds (`appConfig.splashDurationMs`).
2. **Network** — if offline, shows the configured no-network screen (`src/config/app.ts` → `networkErrors`).
3. **Onboarding** — first-time users see a 3-step slider (`app/(onboarding)`), then continue to sign in.
4. **Auth** — signed-out users land on login; signed-in users go to tabs.

## Auth screens

| Route | Purpose |
|-------|---------|
| `/(auth)/login` | Email + password sign in |
| `/(auth)/register` | Create student account |
| `/(auth)/verify-code` | 6-digit OTP after login/register |
| `/(auth)/forgot-password` | Request reset email |
| `/(auth)/reset-password` | Set new password (`?token=` from email or deep link) |

Deep link for password reset: `school-lms://reset-password?token=<token>`

Auth copy and network error messages are configured in `src/config/app.ts`.

## Auth

Login uses `POST /api/v1/auth/login` on the web app. The session token is stored in `expo-secure-store` and sent as `Authorization: Bearer <token>` on API calls.

Demo credentials match the web app (see web README / seed data).
