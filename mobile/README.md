# School mobile app

Expo (React Native) client for the school platform. It talks to the same backend as the web app in `../web`.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (repo uses pnpm workspaces)
- iOS Simulator, Android emulator, or Expo Go on a device

## Setup

From the **repository root**:

```bash
pnpm install
```

Configure the API base URL (required for a **physical device**; optional on simulators using defaults):

```bash
cd mobile
cp .env.local.example .env.local
# Edit EXPO_PUBLIC_API_URL — use your computer's LAN IP, not localhost
```

| Environment | Typical `EXPO_PUBLIC_API_URL` |
|-------------|-------------------------------|
| iOS Simulator | `http://localhost:3000` (default) |
| Android emulator | `http://10.0.2.2:3000` (default) |
| Physical device | `http://<your-lan-ip>:3000` |

Start the web API (from repo root):

```bash
pnpm --filter web dev
```

## Run the app

From repo root:

```bash
pnpm --filter mobile start
```

Or from `mobile/`:

```bash
pnpm start
```

Then press `i` (iOS), `a` (Android), or scan the QR code with Expo Go.

Other scripts:

```bash
pnpm --filter mobile ios
pnpm --filter mobile android
pnpm --filter mobile lint
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
│   ├── config/          # API base URL
│   └── hooks/
└── components/          # Shared UI (themed text, icons)
```

## Auth

Login uses `POST /api/v1/auth/login` on the web app. The session token is stored in `expo-secure-store` and sent as `Authorization: Bearer <token>` on API calls.

Demo credentials match the web app (see web README / seed data).

## Monorepo

This package is `"mobile"` in the root `pnpm-workspace.yaml`. Shared types or utilities can be added under `packages/` later and referenced from `mobile/package.json`.
